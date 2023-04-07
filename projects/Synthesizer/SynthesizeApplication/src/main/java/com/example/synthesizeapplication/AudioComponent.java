package com.example.synthesizeapplication;

public interface AudioComponent {
    AudioClip getClip();

    default boolean hasInput() {
        return false;
    }

    default int availableInputPorts() {
        return 0;
    }
    default void connectInput(AudioComponent input) {
        assert(false);
    }

    default void removeInput(AudioComponent input) {
        assert(false);
    }
}
