package com.example.synthesizeapplication;

import javafx.scene.control.Slider;
import javafx.scene.input.MouseEvent;
import javafx.scene.layout.AnchorPane;
import javafx.scene.layout.Pane;
import javafx.scene.shape.Circle;

public abstract class AudioComponentWidgetBase extends Pane {
    AudioComponentWidgetBase(AudioComponent ac, AnchorPane parent, String name) {}

    abstract void startDrag(MouseEvent e);

    abstract void handleDrag(MouseEvent e);

    abstract void closeWidget();

    abstract AudioComponent getAudioComponent();

    abstract void handleSlider(Slider slider);

    abstract void startConnection(MouseEvent e, Circle output);

    abstract void moveConnection(MouseEvent e);

    abstract void endConnection(MouseEvent e);
}
