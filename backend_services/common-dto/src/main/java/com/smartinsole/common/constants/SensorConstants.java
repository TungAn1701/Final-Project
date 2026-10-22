package com.smartinsole.common.constants;

/**
 * Strategy 1-2-2-1 Sensor Layout and Hardware Protocol Constants.
 */
public final class SensorConstants {

    private SensorConstants() {}

    // BLE 16-byte Custom GATT Packet Protocol
    public static final byte[] BLE_PACKET_HEADER = new byte[]{(byte) 0xAA, (byte) 0x55};
    public static final int BLE_PACKET_SIZE = 16;
    public static final double DEFAULT_SAMPLING_RATE_HZ = 50.0;

    // Sliding Window Gait Detection Thresholds (kPa)
    public static final double STEP_START_PRESSURE_THRESHOLD_KPA = 10.0; // Sum > 10 kPa starts footstep
    public static final double STEP_END_PRESSURE_THRESHOLD_KPA = 5.0;    // Sum < 5 kPa ends footstep
    public static final int MIN_STANCE_SAMPLES = 12; // ~240ms at 50Hz
    public static final int MAX_STANCE_SAMPLES = 120; // ~2400ms at 50Hz

    // Anatomical 2D normalized coordinates (X: Medial->Lateral 0..1, Y: Heel->Toe 0..1)
    // 0: Heel, 1: Hallux, 2: 1st Metatarsal, 3: 5th Metatarsal, 4: Medial Arch, 5: Lateral Arch
    public static final double[] SENSOR_COORDINATES_X = {0.50, 0.32, 0.24, 0.78, 0.28, 0.72};
    public static final double[] SENSOR_COORDINATES_Y = {0.12, 0.92, 0.72, 0.68, 0.42, 0.42};
}
