package com.example.synthesizeapplication;

import javax.sound.sampled.*;

public class AudioListener implements LineListener {
    private Clip clip_;

    public AudioListener(Clip c) {
        clip_ = c;
    }

    @Override
    public void update(LineEvent event) {
        if (event.getType() == LineEvent.Type.STOP) {
            clip_.close();
        }
    }
}
