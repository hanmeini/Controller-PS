package expo.modules.bluetoothhid

import android.Manifest
import android.annotation.SuppressLint
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothClass
import android.bluetooth.BluetoothDevice
import android.bluetooth.BluetoothHidDevice
import android.bluetooth.BluetoothHidDeviceAppSdpSettings
import android.bluetooth.BluetoothManager
import android.bluetooth.BluetoothProfile
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.provider.Settings
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

  private val mainHandler = Handler(Looper.getMainLooper())
  private val pendingProxyCallbacks = mutableListOf<(Boolean) -> Unit>()
  private val pendingRegisterCallbacks = mutableListOf<(Boolean) -> Unit>()
  private val pendingConnectCallbacks = mutableMapOf<String, (Boolean, String?) -> Unit>()

  companion object {
    private const val TAG = "BluetoothHidModule"

    // Standard 7-byte Gamepad Descriptor (LX, LY, RX, RY, Hat Switch, 16 Buttons)
    private val HID_REPORT_DESCRIPTOR = byteArrayOf(
      0x05.toByte(), 0x01.toByte(),        // Usage Page (Generic Desktop Ctrls)
      0x09.toByte(), 0x05.toByte(),        // Usage (Game Pad)
      0xA1.toByte(), 0x01.toByte(),        // Collection (Application)

      // --- Left Stick (X, Y Axes) ---
      0x09.toByte(), 0x01.toByte(),        //   Usage (Pointer)
      0xA1.toByte(), 0x00.toByte(),        //   Collection (Physical)
      0x09.toByte(), 0x30.toByte(),        //     Usage (X)
      0x09.toByte(), 0x31.toByte(),        //     Usage (Y)
      0x15.toByte(), 0x00.toByte(),        //     Logical Minimum (0)
      0x26.toByte(), 0xFF.toByte(), 0x00.toByte(), // Logical Maximum (255)
      0x75.toByte(), 0x08.toByte(),        //     Report Size (8)
      0x95.toByte(), 0x02.toByte(),        //     Report Count (2)
      0x81.toByte(), 0x02.toByte(),        //     Input (Data,Var,Abs)
      0xC0.toByte(),                       //   End Collection

      // --- Right Stick (Z, Rz Axes) ---
      0x09.toByte(), 0x01.toByte(),        //   Usage (Pointer)
      0xA1.toByte(), 0x00.toByte(),        //   Collection (Physical)
      0x09.toByte(), 0x32.toByte(),        //     Usage (Z)
      0x09.toByte(), 0x35.toByte(),        //     Usage (Rz)
      0x15.toByte(), 0x00.toByte(),        //     Logical Minimum (0)
      0x26.toByte(), 0xFF.toByte(), 0x00.toByte(), // Logical Maximum (255)
      0x75.toByte(), 0x08.toByte(),        //     Report Size (8)
      0x95.toByte(), 0x02.toByte(),        //     Report Count (2)
      0x81.toByte(), 0x02.toByte(),        //     Input (Data,Var,Abs)
      0xC0.toByte(),                       //   End Collection

      // --- D-Pad (Hat Switch: 4 bits, 1-8 directions, 0 = neutral) ---
      0x05.toByte(), 0x01.toByte(),        //   Usage Page (Generic Desktop Ctrls)
      0x09.toByte(), 0x39.toByte(),        //   Usage (Hat switch)
      0x15.toByte(), 0x01.toByte(),        //   Logical Minimum (1)
      0x25.toByte(), 0x08.toByte(),        //   Logical Maximum (8)
      0x75.toByte(), 0x04.toByte(),        //   Report Size (4)
      0x95.toByte(), 0x01.toByte(),        //   Report Count (1)
      0x81.toByte(), 0x42.toByte(),        //   Input (Data,Var,Abs,Null)

      // --- 4 Bits Padding (align to 1 byte) ---
      0x75.toByte(), 0x04.toByte(),        //   Report Size (4)
      0x95.toByte(), 0x01.toByte(),        //   Report Count (1)
      0x81.toByte(), 0x01.toByte(),        //   Input (Const)

      // --- 16 Digital Buttons ---
      0x05.toByte(), 0x09.toByte(),        //   Usage Page (Button)
      0x19.toByte(), 0x01.toByte(),        //   Usage Minimum (Button 1)
      0x29.toByte(), 0x10.toByte(),        //   Usage Maximum (Button 16)
      0x15.toByte(), 0x00.toByte(),        //   Logical Minimum (0)
      0x25.toByte(), 0x01.toByte(),        //   Logical Maximum (1)
      0x75.toByte(), 0x01.toByte(),        //   Report Size (1)
      0x95.toByte(), 0x10.toByte(),        //   Report Count (16)
      0x81.toByte(), 0x02.toByte(),        //   Input (Data,Var,Abs)

      0xC0.toByte()                        // End Collection
    )
  }

  private val hidCallback = object : BluetoothHidDevice.Callback() {
    override fun onAppStatusChanged(pluggedDevice: BluetoothDevice?, registered: Boolean) {
      isAppRegistered = registered
      Log.d(TAG, "onAppStatusChanged: registered = $registered")
      sendEvent("onRegistrationStatusChanged", mapOf("registered" to registered))

      synchronized(pendingRegisterCallbacks) {
        val callbacks = pendingRegisterCallbacks.toList()
        pendingRegisterCallbacks.clear()
        callbacks.forEach { it(registered) }
      }
    }

    override fun onConnectionStateChanged(device: BluetoothDevice?, state: Int) {
      val isConnected = state == BluetoothProfile.STATE_CONNECTED
      connectedDevice = if (isConnected) device else null
      val devName = try { device?.name } catch (e: Exception) { null } ?: "Wireless Host"
      val devAddr = device?.address ?: ""
      Log.d(TAG, "onConnectionStateChanged: state = $state, device = $devName ($devAddr)")

      sendEvent("onConnectionStateChanged", mapOf(
        "state" to state,
        "isConnected" to isConnected,
        "deviceName" to devName,
        "deviceAddress" to devAddr
      ))

      synchronized(pendingConnectCallbacks) {
        val cb = pendingConnectCallbacks[devAddr]
        if (cb != null) {
          if (isConnected) {
            cb(true, null)
            pendingConnectCallbacks.remove(devAddr)
          } else if (state == BluetoothProfile.STATE_DISCONNECTED) {
            cb(false, "Koneksi diputus oleh laptop")
            pendingConnectCallbacks.remove(devAddr)
          }
        }
      }
    }
  }

  private val profileListener = object : BluetoothProfile.ServiceListener {
    override fun onServiceConnected(profile: Int, proxy: BluetoothProfile?) {
      if (profile == BluetoothProfile.HID_DEVICE) {
        hidDevice = proxy as? BluetoothHidDevice
        isProxyBound = true
        Log.d(TAG, "HID_DEVICE profile proxy connected successfully")
        sendEvent("onProfileProxyConnected", mapOf("connected" to true))

        // Otomatis daftarkan app sebagai Gamepad segera setelah proxy siap
        registerGamepadInternal { registered ->
          synchronized(pendingProxyCallbacks) {
            val callbacks = pendingProxyCallbacks.toList()
            pendingProxyCallbacks.clear()
            callbacks.forEach { it(registered) }
          }
        }
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
        sendEvent("onRegistrationStatusChanged", mapOf("registered" to false))
      }
    }
  }

  @SuppressLint("MissingPermission")
  private fun ensureProxy(callback: (Boolean) -> Unit) {
    if (hidDevice != null && isProxyBound) {
      callback(true)
      return
    }

    val context = appContext.reactContext
    if (context == null) {
      callback(false)
      return
    }

    val bm = context.getSystemService(Context.BLUETOOTH_SERVICE) as? BluetoothManager
    val adapter = bm?.adapter
    if (adapter == null || !adapter.isEnabled) {
      callback(false)
      return
    }
    bluetoothAdapter = adapter

    synchronized(pendingProxyCallbacks) {
      pendingProxyCallbacks.add(callback)
    }

    try {
      val initiated = adapter.getProfileProxy(context, profileListener, BluetoothProfile.HID_DEVICE)
      if (!initiated) {
        Log.e(TAG, "getProfileProxy returned false (HID Device profile unsupported)")
        synchronized(pendingProxyCallbacks) {
          val callbacks = pendingProxyCallbacks.toList()
          pendingProxyCallbacks.clear()
          callbacks.forEach { it(false) }
        }
      }
    } catch (e: Exception) {
      Log.e(TAG, "getProfileProxy exception", e)
      synchronized(pendingProxyCallbacks) {
        val callbacks = pendingProxyCallbacks.toList()
        pendingProxyCallbacks.clear()
        callbacks.forEach { it(false) }
      }
    }
  }

  @SuppressLint("MissingPermission")
  private fun registerGamepadInternal(callback: ((Boolean) -> Unit)? = null) {
    val context = appContext.reactContext
    val hid = hidDevice
    if (context == null || hid == null) {
      callback?.invoke(false)
      return
    }

    if (isAppRegistered) {
      callback?.invoke(true)
      return
    }

    if (callback != null) {
      synchronized(pendingRegisterCallbacks) {
        pendingRegisterCallbacks.add(callback)
      }
    }

    try {
      val sdp = BluetoothHidDeviceAppSdpSettings(
        "Wireless Controller",
        "PlayStation Bluetooth Controller",
        "Sony/Hanmeini",
        BluetoothHidDevice.SUBCLASS2_GAMEPAD,
        HID_REPORT_DESCRIPTOR
      )
      val ok = hid.registerApp(sdp, null, null, ContextCompat.getMainExecutor(context), hidCallback)
      if (!ok) {
        Log.e(TAG, "hid.registerApp returned false")
        synchronized(pendingRegisterCallbacks) {
          val callbacks = pendingRegisterCallbacks.toList()
          pendingRegisterCallbacks.clear()
          callbacks.forEach { it(false) }
        }
      }
    } catch (e: Exception) {
      Log.e(TAG, "registerGamepadInternal exception", e)
      synchronized(pendingRegisterCallbacks) {
        val callbacks = pendingRegisterCallbacks.toList()
        pendingRegisterCallbacks.clear()
        callbacks.forEach { it(false) }
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

    Function("hasBluetoothPermissions") {
      val context = appContext.reactContext ?: return@Function false
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        val connect = ContextCompat.checkSelfPermission(context, Manifest.permission.BLUETOOTH_CONNECT) == PackageManager.PERMISSION_GRANTED
        val scan = ContextCompat.checkSelfPermission(context, Manifest.permission.BLUETOOTH_SCAN) == PackageManager.PERMISSION_GRANTED
        val adv = ContextCompat.checkSelfPermission(context, Manifest.permission.BLUETOOTH_ADVERTISE) == PackageManager.PERMISSION_GRANTED
        return@Function connect && scan && adv
      }
      return@Function true
    }

    Function("requestBluetoothPermissions") {
      val activity = appContext.currentActivity ?: return@Function false
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        activity.requestPermissions(
          arrayOf(
            Manifest.permission.BLUETOOTH_CONNECT,
            Manifest.permission.BLUETOOTH_SCAN,
            Manifest.permission.BLUETOOTH_ADVERTISE,
            Manifest.permission.ACCESS_FINE_LOCATION
          ),
          2001
        )
        return@Function true
      }
      return@Function true
    }

    Function("isSupported") {
      val context = appContext.reactContext ?: return@Function false
      val bm = context.getSystemService(Context.BLUETOOTH_SERVICE) as? BluetoothManager
      bluetoothAdapter = bm?.adapter
      return@Function bluetoothAdapter != null && Build.VERSION.SDK_INT >= Build.VERSION_CODES.P
    }

    Function("isEnabled") {
      val bm = appContext.reactContext?.getSystemService(Context.BLUETOOTH_SERVICE) as? BluetoothManager
      return@Function bm?.adapter?.isEnabled ?: false
    }

    Function("isRegistered") {
      return@Function isAppRegistered
    }

    Function("isConnected") {
      return@Function connectedDevice != null
    }

    @SuppressLint("MissingPermission")
    Function("getMyDeviceName") {
      val bm = appContext.reactContext?.getSystemService(Context.BLUETOOTH_SERVICE) as? BluetoothManager
      return@Function bm?.adapter?.name ?: "HP Android"
    }

    @SuppressLint("MissingPermission")
    Function("getConnectedDeviceName") {
      return@Function connectedDevice?.name ?: ""
    }

    @SuppressLint("MissingPermission")
    Function("getBluetoothDiagnostics") {
      val bm = appContext.reactContext?.getSystemService(Context.BLUETOOTH_SERVICE) as? BluetoothManager
      val adapter = bm?.adapter
      val isEnabled = adapter?.isEnabled ?: false
      val context = appContext.reactContext

      var hasPerms = true
      if (context != null && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        val connect = ContextCompat.checkSelfPermission(context, Manifest.permission.BLUETOOTH_CONNECT) == PackageManager.PERMISSION_GRANTED
        val scan = ContextCompat.checkSelfPermission(context, Manifest.permission.BLUETOOTH_SCAN) == PackageManager.PERMISSION_GRANTED
        val adv = ContextCompat.checkSelfPermission(context, Manifest.permission.BLUETOOTH_ADVERTISE) == PackageManager.PERMISSION_GRANTED
        hasPerms = connect && scan && adv
      }

      val myName = try { adapter?.name ?: "HP Android" } catch (e: Exception) { "HP Android" }
      val targetName = try { connectedDevice?.name ?: "" } catch (e: Exception) { "" }

      return@Function mapOf(
        "isSupported" to (adapter != null && Build.VERSION.SDK_INT >= Build.VERSION_CODES.P),
        "isEnabled" to isEnabled,
        "hasPermissions" to hasPerms,
        "isProxyConnected" to isProxyBound,
        "isRegistered" to isAppRegistered,
        "isConnected" to (connectedDevice != null),
        "connectedDeviceName" to targetName,
        "myDeviceName" to myName
      )
    }

    Function("initProfileProxy") {
      val context = appContext.reactContext ?: return@Function false
      val bm = context.getSystemService(Context.BLUETOOTH_SERVICE) as? BluetoothManager
      bluetoothAdapter = bm?.adapter ?: return@Function false

      if (!bluetoothAdapter!!.isEnabled) {
        return@Function false
      }

      return@Function try {
        bluetoothAdapter?.getProfileProxy(context, profileListener, BluetoothProfile.HID_DEVICE) ?: false
      } catch (e: Exception) {
        Log.e(TAG, "initProfileProxy error", e)
        false
      }
    }

    @SuppressLint("MissingPermission")
    AsyncFunction("registerGamepadApp") { promise: Promise ->
      ensureProxy { ready ->
        if (!ready) {
          promise.reject("ERR_NOT_READY", "Layanan Bluetooth HID belum siap. Pastikan Bluetooth di HP aktif.", null)
          return@ensureProxy
        }
        registerGamepadInternal { registered ->
          promise.resolve(registered)
        }
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
    Function("openBluetoothSettings") {
      val context = appContext.reactContext ?: return@Function false
      return@Function try {
        val intent = Intent(Settings.ACTION_BLUETOOTH_SETTINGS).apply {
          flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        context.startActivity(intent)
        true
      } catch (e: Exception) {
        false
      }
    }

    @SuppressLint("MissingPermission")
    Function("getPairedDevices") {
      val bm = appContext.reactContext?.getSystemService(Context.BLUETOOTH_SERVICE) as? BluetoothManager
      val adapter = bm?.adapter ?: return@Function emptyList<Map<String, Any>>()
      if (!adapter.isEnabled) return@Function emptyList<Map<String, Any>>()

      return@Function try {
        val bonded = adapter.bondedDevices ?: return@Function emptyList<Map<String, Any>>()
        bonded.map { dev ->
          val devClass = dev.bluetoothClass
          val majorClass = devClass?.majorDeviceClass ?: 0
          val isComputer = majorClass == BluetoothClass.Device.Major.COMPUTER
          mapOf(
            "name" to (dev.name ?: "Unknown Device"),
            "address" to dev.address,
            "isComputer" to isComputer
          )
        }.sortedByDescending { it["isComputer"] as? Boolean ?: false }
      } catch (e: Exception) {
        Log.e(TAG, "getPairedDevices error", e)
        emptyList<Map<String, Any>>()
      }
    }

    @SuppressLint("MissingPermission")
    AsyncFunction("connectDevice") { address: String, promise: Promise ->
      ensureProxy { ready ->
        if (!ready) {
          promise.reject("ERR_NOT_READY", "Layanan Bluetooth HID belum siap. Pastikan Bluetooth aktif di HP.", null)
          return@ensureProxy
        }

        registerGamepadInternal { registered ->
          val adapter = bluetoothAdapter
          val hid = hidDevice

          if (adapter == null || hid == null) {
            promise.reject("ERR_NOT_READY", "Bluetooth adapter atau HID tidak tersedia", null)
            return@registerGamepadInternal
          }

          try {
            val device = adapter.getRemoteDevice(address)
            if (device == null) {
              promise.reject("ERR_NOT_FOUND", "Perangkat dengan alamat $address tidak ditemukan", null)
              return@registerGamepadInternal
            }

            // Callback dengan timeout 12 detik
            val timeoutRunnable = Runnable {
              synchronized(pendingConnectCallbacks) {
                val cb = pendingConnectCallbacks.remove(address)
                cb?.invoke(false, "Waktu koneksi habis. Laptop tidak merespons.")
              }
            }

            mainHandler.postDelayed(timeoutRunnable, 12000)

            synchronized(pendingConnectCallbacks) {
              pendingConnectCallbacks[address] = { success, message ->
                mainHandler.removeCallbacks(timeoutRunnable)
                if (success) {
                  promise.resolve(true)
                } else {
                  promise.reject("ERR_CONNECT", message ?: "Gagal terhubung ke $address", null)
                }
              }
            }

            val initiated = hid.connect(device)
            Log.d(TAG, "hid.connect($address) initiated = $initiated")
            if (!initiated) {
              mainHandler.removeCallbacks(timeoutRunnable)
              synchronized(pendingConnectCallbacks) {
                pendingConnectCallbacks.remove(address)
              }
              promise.reject("ERR_INITIATE", "Gagal memulai koneksi Bluetooth ke $address. Pastikan laptop menyala dan Bluetooth aktif.", null)
            }
          } catch (e: Exception) {
            Log.e(TAG, "connectDevice failed", e)
            promise.reject("ERR_CONNECT", e.message, e)
          }
        }
      }
    }

    @SuppressLint("MissingPermission")
    Function("disconnectDevice") {
      val dev = connectedDevice ?: return@Function false
      val hid = hidDevice ?: return@Function false
      return@Function try {
        val success = hid.disconnect(dev)
        connectedDevice = null
        success
      } catch (e: Exception) {
        false
      }
    }

    @SuppressLint("MissingPermission")
    Function("sendGamepadReport") { buttons: Int, dpad: Int, lx: Int, ly: Int, rx: Int, ry: Int, l2: Int, r2: Int ->
      val dev = connectedDevice ?: return@Function false
      val hid = hidDevice ?: return@Function false

      var btnMask = buttons
      if (l2 > 50) btnMask = btnMask or (1 shl 6)
      if (r2 > 50) btnMask = btnMask or (1 shl 7)

      // 7-Byte Report: LX, LY, RX, RY, Hat Switch, Buttons LSB, Buttons MSB
      val report = byteArrayOf(
        (lx and 0xFF).toByte(),
        (ly and 0xFF).toByte(),
        (rx and 0xFF).toByte(),
        (ry and 0xFF).toByte(),
        (dpad and 0x0F).toByte(),
        (btnMask and 0xFF).toByte(),
        ((btnMask shr 8) and 0xFF).toByte()
      )

      return@Function try {
        hid.sendReport(dev, 0, report)
      } catch (e: Exception) {
        false
      }
    }
  }
}
