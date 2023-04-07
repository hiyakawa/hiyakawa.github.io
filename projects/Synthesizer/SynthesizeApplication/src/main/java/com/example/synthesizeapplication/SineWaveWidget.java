package com.example.synthesizeapplication;

import javafx.geometry.Bounds;
import javafx.geometry.Insets;
import javafx.geometry.Orientation;
import javafx.geometry.Pos;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.Slider;
import javafx.scene.input.MouseEvent;
import javafx.scene.layout.AnchorPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;
import javafx.scene.paint.Color;
import javafx.scene.shape.Circle;
import javafx.scene.shape.Line;

public class SineWaveWidget extends AudioComponentWidgetBase {
    private AudioComponent audioComponent_;
    protected AnchorPane parent_;
    private HBox baseLayout_;
    private String name_;
    private Label nameLable_;
    protected Line line_;
    protected Circle volumeOutput_;
    protected static int CIRCLE_RADIUS = 10;
    protected VolumeWidget connectedWidget_;
    private double mouseStartDragX_, mouseStartDragY_;
    private double widgetStartDragX_, widgetStartDragY_;

    SineWaveWidget(AudioComponent ac, AnchorPane parent, String name) {
        super(ac, parent, name);
        audioComponent_ = ac;
        parent_ = parent;
        name_ = name;

        baseLayout_ = new HBox();
        baseLayout_.setStyle("-fx-border-color: gray;" +
                "-fx-background-color: #ffffff");

        this.getChildren().add(baseLayout_);

        // center
        VBox center = new VBox();
        center.setAlignment(Pos.CENTER);

        nameLable_ = new Label();
        nameLable_.setMouseTransparent(true);
        nameLable_.setText("    Sine Wave\n        440 Hz");

        Slider slider = new Slider(220, 880, 440);
        slider.setOrientation(Orientation.VERTICAL);
        slider.setOnMouseDragged(e-> handleSlider(slider));

        center.getChildren().addAll(nameLable_, slider);

        center.setOnMousePressed(e -> startDrag(e));
        center.setOnMouseDragged(e -> handleDrag(e));

        // right
        VBox rightSide = new VBox();
        rightSide.setAlignment(Pos.CENTER);
        rightSide.setPadding(new Insets(5));
        rightSide.setSpacing(5);

        Button closeBtn = new Button("×");
        closeBtn.setOnAction(e -> closeWidget());

        volumeOutput_ = new Circle(CIRCLE_RADIUS);
        volumeOutput_.setFill(Color.rgb(9, 1, 102));
        volumeOutput_.setStroke(Color.DARKGRAY);

        volumeOutput_.setOnMousePressed(e -> startConnection(e, volumeOutput_));
        volumeOutput_.setOnMouseDragged(e -> moveConnection(e));
        volumeOutput_.setOnMouseReleased(e -> endConnection(e));

        rightSide.getChildren().addAll(closeBtn, volumeOutput_);
        baseLayout_.getChildren().addAll(center, rightSide);
        parent_.getChildren().add(this);
    }

    void startDrag(MouseEvent e) {
        mouseStartDragX_ = e.getSceneX();
        mouseStartDragY_ = e.getSceneY();

        widgetStartDragX_ = this.getLayoutX();
        widgetStartDragY_ = this.getLayoutY();
    }

    void handleDrag(MouseEvent e) {
        double mouseDelX = e.getSceneX() - mouseStartDragX_;
        double mouseDelY = e.getSceneY() - mouseStartDragY_;
        this.relocate(widgetStartDragX_ + mouseDelX, widgetStartDragY_ + mouseDelY);

        Bounds parentBounds = parent_.getBoundsInParent();
        Bounds volumeBounds = volumeOutput_.localToScene(volumeOutput_.getBoundsInLocal());

        if (line_ != null) {
            line_.setStartX(volumeBounds.getCenterX() - parentBounds.getMinX());
            line_.setStartY(volumeBounds.getCenterY() - parentBounds.getMinY());
        }
    }

    void closeWidget() {
        parent_.getChildren().remove(this);
        SynthesizeApplication.widgets_.remove(this);
        SynthesizeApplication.widgetsConnectedToSpeaker_.remove(this);

        if (line_ != null) {
            parent_.getChildren().remove(line_);
            connectedWidget_.filterAC_.removeInput(this.audioComponent_);
        }
    }

    public AudioComponent getAudioComponent() {
        return audioComponent_;
    }

    void handleSlider(Slider slider) {
        double frequency = slider.getValue();
        nameLable_.setText("    Sine Wave\n        " + (int) frequency + " Hz");
        ((SineWave) audioComponent_).setFrequency(frequency);
    }

    void startConnection(MouseEvent e, Circle output) {
        if (line_ != null) {
            parent_.getChildren().remove(line_);
        }

        Bounds parentBounds = parent_.getBoundsInParent();
        Bounds bounds = output.localToScene(output.getBoundsInLocal());

        Cable cable = new Cable();
        line_ = cable.line_;
        line_.setStyle("-fx-stroke: #090166");
        cable.startSWWidget_ = this;
        line_.setStartX(bounds.getCenterX() - parentBounds.getMinX());
        line_.setStartY(bounds.getCenterY() - parentBounds.getMinY());
        line_.setEndX(e.getSceneX());
        line_.setEndY(e.getSceneY());
        parent_.getChildren().add(line_);
    }

    void moveConnection(MouseEvent e) {
        Bounds parentBounds = parent_.getBoundsInParent();
        line_.setEndX(e.getSceneX() - parentBounds.getMinX());
        line_.setEndY(e.getSceneY() - parentBounds.getMinY());
    }

    void endConnection(MouseEvent e) {
        Circle volumeCircle = VolumeWidget.swOutput_;
        Bounds volumeCircleBounds = volumeCircle.localToScreen(volumeCircle.getBoundsInLocal());
        double distance = Math.sqrt(Math.pow(volumeCircleBounds.getCenterX() - e.getScreenX(), 2.0) +
                Math.pow(volumeCircleBounds.getCenterY() - e.getScreenY(), 2.0));
        VolumeWidget curWidget = (VolumeWidget) volumeCircle.getParent().getParent().getParent();

        if (distance < CIRCLE_RADIUS) {
            VolumeWidget.filterAC_.connectInput(audioComponent_);
            connectedWidget_ = curWidget;
            curWidget.connectedWidget_ = this;
        }
        else {
            parent_.getChildren().remove(line_);
            line_ = null;
            connectedWidget_.filterAC_.removeInput(this.audioComponent_);
        }
    }
}
