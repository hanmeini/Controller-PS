package expo.modules.bluetoothhid

import android.annotation.SuppressLint
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothDevice
import android.bluetooth.BluetoothHidDevice
import android.bluetooth.BluetoothHidDeviceAppQosSettings
import android.bluetooth.BluetoothHidDeviceAppSdpSettings
import android.bluetooth.BluetoothManager
import android.bluetooth.BluetoothProfile
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log
import androidx.core.content.ContextCompat
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.Promise

class BluetoothHidModule : Module() {
  private var bluetoothAdapter: BluetoothAdapter? = null
  private var hidDevice: BluetoothHidDevice? = null
  private var isAppRegistered = false
  private var connectedDevice: BluetoothDevice? = null
  private var isProxyBound = false

  companion object {
    private const val TAG = "BluetoothHidModule"
    private const val REPORT_ID = 1.toByte()

    // 16 Buttons, 1 Hat switch, 4 Analog axes (LX, LY, RX, RY), 2 Triggers (L2, R2)
    private val HID_REPORT_DESCRIPTOR = byteArrayOf(
      0x05.toByte(), 0x01.toByte(),        // Usage Page (Generic Desktop Ctrls)
      0x09.toByte(), 0x05.toByte(),        // Usage (Game Pad)
      0xA1.toByte(), 0x01.toByte(),        // Collection (Application)
      0x85.toByte(), 0x01.toByte(),        //   Report ID (1)

      // 16 Buttons (Square, Cross, Circle, Triangle, L1, R1, L2, R2, Select, Start, L3, R3, PS, Touchpad, Aux1, Aux2)
      0x05.toByte(), 0x09.toByte(),        //   Usage Page (Button)
      0x19.toByte(), 0x01.toByte(),        //   Usage Minimum (1)
      0x29.toByte(), 0x10.toByte(),        //   Usage Maximum (16)
      0x15.toByte(), 0x00.toByte(),        //   Logical Minimum (0)
      0x25.toByte(), 0x01.toByte(),        //   Logical Maximum (1)
      0x75.toByte(), 0x01.toByte(),        //   Report Size (1)
      0x95.toByte(), 0x10.toByte(),        //   Report Count (16)
      0x81.toByte(), 0x02.toByte(),        //   Input (Data,Var,Abs)

      // Hat switch (D-Pad: 8 directions + null state = 0)
      0x05.toByte(), 0x01.toByte(),        //   Usage Page (Generic Desktop Ctrls)
      0x09.toByte(), 0x39.toByte(),        //   Usage (Hat switch)
      0x15.toByte(), 0x01.toByte(),        //   Logical Minimum (1)
      0x25.toByte(), 0x08.toByte(),        //   Logical Maximum (8)
      0x35.toByte(), 0x00.toByte(),        //   Physical Minimum (0)
      0x46.toByte(), 0x3B.toByte(), 0x01.toByte(), // Physical Maximum (315)
      0x65.toByte(), 0x14.toByte(),        //   Unit (English Rotation)
      0x75.toByte(), 0x04.toByte(),        //   Report Size (4)
      0x95.toByte(), 0x01.toByte(),        //   Report Count (1)
      0x81.toByte(), 0x42.toByte(),        //   Input (Data,Var,Abs,Null)
      0x75.toByte(), 0x04.toByte(),        //   Report Size (4) padding
      0x95.toByte(), 0x01.toByte(),        //   Report Count (1)
      0x81.toByte(), 0x01.toByte(),        //   Input (Const)

      // 4 Analog axes: LX, LY, RX, RY (0-255)
      0x09.toByte(), 0x30.toByte(),        //   Usage (X)
      0x09.toByte(), 0x31.toByte(),        //   Usage (Y)
      0x09.toByte(), 0x32.toByte(),        //   Usage (Z)
      0x09.toByte(), 0x35.toByte(),        //   Usage (Rz)
      0x15.toByte(), 0x00.toByte(),        //   Logical Minimum (0)
      0x26.toByte(), 0xFF.toByte(), 0x00.toByte(), // Logical Maximum (255)
      0x75.toByte(), 0x08.toByte(),        //   Report Size (8)
      0x95.toByte(), 0x04.toByte(),        //   Report Count (4)
      0x81.toByte(), 0x02.toByte(),        //   Input (Data,Var,Abs)

      // 2 Trigger axes: L2, R2 (0-255)
      0x09.toByte(), 0x33.toByte(),        //   Usage (Rx)
      0x09.toByte(), 0x34.toByte(),        //   Usage (Ry)
      0x15.toByte(), 0x00.toByte(),        //   Logical Minimum (0)
      0x26.toByte(), 0xFF.toByte(), 0x00.toByte(), // Logical Maximum (255)
      0x75.toByte(), 0x08.toByte(),        //   Report Size (8)
      0x95.toByte(), 0x02.toByte(),        //   Report Count (2)
      0x81.toByte(), 0x02.toByte(),        //   Input (Data,Var,Abs)

      0xC0.toByte()                        // End Collection
    )
  }

  private val hidCallback = object : BluetoothHidDevice.Callback() {
    override fun onAppStatusChanged(pluggedDevice: BluetoothDevice?, registered: Boolean) {
      isAppRegistered = registered
      Log.d(TAG, "onAppStatusChanged: registered = $registered")
      sendEvent("onRegistrationStatusChanged", mapOf("registered" to registered))
    }

    override fun onConnectionStateChanged(device: BluetoothDevice?, state: Int) {
      val isConnected = state == BluetoothProfile.STATE_CONNECTED
      connectedDevice = if (isConnected) device else null
      Log.d(TAG, "onConnectionStateChanged: state = $state, device = ${device?.name ?: device?.address}")
      sendEvent("onConnectionStateChanged", mapOf(
        "state" to state,
        "isConnected" to isConnected,
        "deviceName" to (device?.name ?: "Unknown"),
        "deviceAddress" to (device?.address ?: "")
      ))
    }
  }

  private val profileListener = object : BluetoothProfile.ServiceListener {
    override fun onServiceConnected(profile: Int, proxy: BluetoothProfile?) {
      if (profile == BluetoothProfile.HID_DEVICE) {
        hidDevice = proxy as? BluetoothHidDevice
        isProxyBound = true
        Log.d(TAG, "HID_DEVICE profile proxy connected")
        sendEvent("onProfileProxyConnected", mapOf("connected" to true))
      }
    }

    override fun onServiceDisconnected(profile: Int) {
      if (profile == BluetoothProfile.HID_DEVICE) {
        hidDevice = null
        isProxyBound = false
        isAppRegistered = false
        connectedDevice = null
        Log.d(TAG, "HID_DEVICE profile proxy disconnected")
        sendEvent("onProfileProxyConnected", mapOf("connected" to false))
      }
    }
  }

  override fun definition() = ModuleDefinition {
    Name("BluetoothHid")

    Events(
      "onRegistrationStatusChanged",
      "onConnectionStateChanged",
      "onProfileProxyConnected"
    )

    Function("isSupported") {
      val context = appContext.reactContext ?: return@Function false
      val bm = context.getSystemService(Context.BLUETOOTH_SERVICE) as? BluetoothManager
      bluetoothAdapter = bm?.adapter
      return@Function bluetoothAdapter != null && Build.VERSION.SDK_INT >= Build.VERSION_CODES.P
    }

    Function("isEnabled") {
      return@Function bluetoothAdapter?.isEnabled ?: false
    }

    Function("isRegistered") {
      return@Function isAppRegistered
    }

    Function("isConnected") {
      return@Function connectedDevice != null
    }

    Function("getConnectedDeviceName") {
      return@Function connectedDevice?.name ?: ""
    }

    Function("initProfileProxy") {
      val context = appContext.reactContext ?: return@Function false
      val bm = context.getSystemService(Context.BLUETOOTH_SERVICE) as? BluetoothManager
      bluetoothAdapter = bm?.adapter ?: return@Function false

      return@Function try {
        bluetoothAdapter?.getProfileProxy(context, profileListener, BluetoothProfile.HID_DEVICE) ?: false
      } catch (e: Exception) {
        Log.e(TAG, "initProfileProxy error", e)
        false
      }
    }

    @SuppressLint("MissingPermission")
    AsyncFunction("registerGamepadApp") { promise: Promise ->
      val context = appContext.reactContext
      if (context == null || hidDevice == null) {
        promise.reject("ERR_NOT_READY", "HID Profile proxy belum siap", null)
        return@AsyncFunction
      }

      try {
        val sdp = BluetoothHidDeviceAppSdpSettings(
          "Wireless Controller",
          "PlayStation Bluetooth Controller",
          "Sony/Hanmeini",
          BluetoothHidDevice.SUBCLASS1_GAMEPAD,
          HID_REPORT_DESCRIPTOR
        )

        val qos = BluetoothHidDeviceAppQosSettings(
          BluetoothHidDeviceAppQosSettings.SERVICE_BEST_EFFORT,
          800,
          9,
          0,
          11250,
          BluetoothHidDeviceAppQosSettings.MAX
        )

        val success = hidDevice?.registerApp(sdp, null, qos, ContextCompat.getMainExecutor(context), hidCallback) ?: false
        promise.resolve(success)
      } catch (e: Exception) {
        Log.e(TAG, "registerGamepadApp failed", e)
        promise.reject("ERR_REGISTER", e.message, e)
      }
    }

    @SuppressLint("MissingPermission")
    Function("unregisterGamepadApp") {
      return@Function try {
        val success = hidDevice?.unregisterApp() ?: false
        isAppRegistered = false
        connectedDevice = null
        success
      } catch (e: Exception) {
        Log.e(TAG, "unregisterGamepadApp failed", e)
        false
      }
    }

    @SuppressLint("MissingPermission")
    Function("requestDiscoverable") {
      val context = appContext.reactContext ?: return@Function false
      return@Function try {
        val discoverableIntent = Intent(BluetoothAdapter.ACTION_REQUEST_DISCOVERABLE).apply {
          putExtra(BluetoothAdapter.EXTRA_DISCOVERABLE_DURATION, 300)
          flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        context.startActivity(discoverableIntent)
        true
      } catch (e: Exception) {
        Log.e(TAG, "requestDiscoverable error", e)
        false
      }
    }

    @SuppressLint("MissingPermission")
    Function("sendGamepadReport") { buttons: Int, dpad: Int, lx: Int, ly: Int, rx: Int, ry: Int, l2: Int, r2: Int ->
      val dev = connectedDevice ?: return@Function false
      val hid = hidDevice ?: return@Function false

      val report = byteArrayOf(
        (buttons and 0xFF).toByte(),
        ((buttons shr 8) and 0xFF).toByte(),
        (dpad and 0x0F).toByte(),
        (lx and 0xFF).toByte(),
        (ly and 0xFF).toByte(),
        (rx and 0xFF).toByte(),
        (ry and 0xFF).toByte(),
        (l2 and 0xFF).toByte(),
        (r2 and 0xFF).toByte()
      )

      return@Function try {
        hid.sendReport(dev, REPORT_ID.toInt(), report)
      } catch (e: Exception) {
        false
      }
    }
  }
}
