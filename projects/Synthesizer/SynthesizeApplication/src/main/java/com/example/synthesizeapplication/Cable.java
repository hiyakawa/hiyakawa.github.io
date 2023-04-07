package com.example.synthesizeapplication;

import javafx.scene.shape.Line;

public class Cable {
    public static Line line_;
    public static SineWaveWidget startSWWidget_;
    public static VolumeWidget endVolumeWidget_;
    public static VolumeWidget startVolumeWidget;

    Cable() {
        line_ = new Line();
        line_.setStrokeWidth(2);
    }

}
