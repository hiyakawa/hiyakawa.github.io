package com.example.synthesizeapplication;

import static java.lang.Math.PI;
import static java.lang.Math.sin;

public class VFSineWave implements AudioComponent {
    private AudioComponent input_;

    @Override
    public AudioClip getClip() {
        AudioClip output = new AudioClip();
        AudioClip input = input_.getClip();
        double phase = 0;

        for (int i = 0; i < AudioClip.TOTAL_SAMPLES; i++) {
            phase += (2 * PI * input.getSample(i) / input.getSampleRate());
            output.setSample(i, (short) (Short.MAX_VALUE * sin(phase)));
        }
        return output;
    }

    @Override
    public boolean hasInput() {
        return false;
    }

    @Override
    public void connectInput(AudioComponent input) {
        input_ = input;
    }
}