package com.example.synthesizeapplication;

import java.util.Arrays;

public class AudioClip {
    private final static double DURATION = 2.0;
    private final static int SAMPLE_RATE = 44100;
    public final static int TOTAL_SAMPLES = (int) DURATION * SAMPLE_RATE;
    private byte [] data_;

    public AudioClip() {
        data_ = new byte [(int) DURATION * SAMPLE_RATE * 2];
    }

    public short getSample(int index) {
        short low = (short) (data_[index * 2] & 0xFF);
        short high = (short) (data_[index * 2 + 1] << 8);
        return (short) (high | low);
    }

    public void setSample(int index, short value) {
        data_[index * 2] = (byte) (value & 0xff);
        data_[index * 2 + 1] = (byte) (value >> 8 & 0xff);
    }

    public byte[] getData() {
        return Arrays.copyOf(data_, data_.length);
    }

    public int getSampleRate() {
        return SAMPLE_RATE;
    }
}