package com.example.synthesizeapplication;

import java.util.ArrayList;

public class Mixer implements AudioComponent {
    private ArrayList<AudioComponent> inputs_;

    Mixer() {
        inputs_ = new ArrayList<>();
    }

    @Override
    public AudioClip getClip() {
        AudioClip result = new AudioClip();

        for (AudioComponent input : inputs_) {
            AudioClip c = input.getClip();

            for (int i = 0; i < AudioClip.TOTAL_SAMPLES; i++) {
                result.setSample(i, (short) (result.getSample(i) + c.getSample(i)));
            }
        }
        return result;
    }

    @Override
    public boolean hasInput() {
        return false;
    }

    @Override
    public void connectInput(AudioComponent input) {
        inputs_.add(input);
    }
}