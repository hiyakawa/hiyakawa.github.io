package com.example.synthesizeapplication;

public class Filter implements AudioComponent {
    private AudioComponent input_;
    private double scale_;

    Filter(double scale) {
        scale_ = scale;
    }

    @Override
    public AudioClip getClip() {
        AudioClip original = input_.getClip();
        AudioClip result = new AudioClip();

        for (int i = 0; i < AudioClip.TOTAL_SAMPLES; i++) {
            short resultVolume = (short) (scale_ * original.getSample(i));
            result.setSample(i, resultVolume);
        }
        return result;
    }

    @Override
    public boolean hasInput() {
        return false;
    }

    @Override
    public void connectInput(AudioComponent input) {
        input_ = input;
    }

    public void removeInput(AudioComponent input) {
        input_ = null;
    }

    public void setScale_(double scale) {
        scale_ = scale;
    }
}