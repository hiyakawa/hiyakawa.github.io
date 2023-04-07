package com.example.synthesizeapplication;

import javafx.application.Application;
import javax.sound.sampled.*;

public class Main {
    public static void main(String[] args) throws LineUnavailableException {
        Application.launch(SynthesizeApplication.class);

//        Clip c = AudioSystem.getClip();
//        AudioFormat format16 = new AudioFormat(44100, 16, 1, true, false);
//
//        AudioComponent gen = new SineWave(220);
//        AudioClip clip = gen.getClip();

//        // filter
//        Filter filter = new Filter(0.5);
//        AudioComponent sineWave = new SineWave(200);
//        filter.connectInput(sineWave);
//        AudioClip filterClip = filter.getClip();
//        // c.open(format16, filterClip.getData(), 0, filterClip.getData().length);
//
//        // mixer
//        Mixer mixer = new Mixer();
//        mixer.connectInput(sineWave);
//        mixer.connectInput(gen);
//        filter.connectInput(mixer);
//        AudioClip mixerClip = filter.getClip();
//        c.open(format16, mixerClip.getData(), 0, mixerClip.getData().length);

//        c.open(format16, clip.getData(), 0, clip.getData().length);
//        System.out.println("About to play...");
//        c.start();
//        c.loop(2);
//
//        while(c.getFramePosition() < AudioClip.TOTAL_SAMPLES || c.isActive() || c.isRunning()) {
//            // Do nothing while we wait for the note to play.
//        }
//
//        System.out.println("Done.");
//        c.close();
    }
}