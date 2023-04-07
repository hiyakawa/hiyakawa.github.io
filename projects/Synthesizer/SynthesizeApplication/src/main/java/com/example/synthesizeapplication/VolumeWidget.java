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
import java.math.BigDecimal;
import java.math.RoundingMode;

import static com.example.synthesizeapplication.SynthesizeApplication.SPEAKER_RADIUS;

public class VolumeWidget extends AudioComponentWidgetBase {
    protected static Filter filterAC_;
    private AnchorPane parent_;
    private HBox baseLayout;
    private String name_;
    protected Line line_;
    private Label nameLable_;
    protected SineWaveWidget connectedWidget_;
    protected static Circle swOutput_;
    private Circle speakerOutput_;
    protected static int CIRCLE_RADIUS = 10;
    private double mouseStartDragX_, mouseStartDragY_;
    private double widgetStartDragX_, widgetStartDragY_;

    VolumeWidget(Filter ac, AnchorPane parent, String name) {
        super(ac, parent, name);
        filterAC_ = ac;
        parent_ = parent;
        name_ = name;

        baseLayout = new HBox();
        baseLayout.setStyle("-fx-border-color: lightgray;" +
                "-fx-background-color: #d6d6cf");
        this.getChildren().add(baseLayout);

        // center
        VBox center = new VBox();
        center.setAlignment(Pos.CENTER);

        nameLable_ = new Label();
        nameLable_.setMouseTransparent(true);
        nameLable_.setText("    Volume Scale\n          × 1.00");

        Slider slider = new Slider(0, 5, 1);
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

        swOutput_ = new Circle(CIRCLE_RADIUS);
        swOutput_.setFill(Color.rgb(9, 1, 102));
        swOutput_.setStroke(Color.WHITE);

        speakerOutput_ = new Circle(CIRCLE_RADIUS);
        speakerOutput_.setFill(Color.GRAY);
        speakerOutput_.setStroke(Color.WHITE);

        speakerOutput_.setOnMousePressed(e -> startConnection(e, speakerOutput_));
        speakerOutput_.setOnMouseDragged(e -> moveConnection(e));
        speakerOutput_.setOnMouseReleased(e -> endConnection(e));

        rightSide.getChildren().addAll(closeBtn, swOutput_, speakerOutput_);
        baseLayout.getChildren().addAll(center, rightSide);
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
        Bounds speakerBounds = speakerOutput_.localToScene(speakerOutput_.getBoundsInLocal());
        Bounds swBounds = swOutput_.localToScene(swOutput_.getBoundsInLocal());

        if (line_ != null) {
            line_.setStartX(speakerBounds.getCenterX() - parentBounds.getMinX());
            line_.setStartY(speakerBounds.getCenterY() - parentBounds.getMinY());
        }

        if (connectedWidget_ != null && connectedWidget_.line_ != null) {
            connectedWidget_.line_.setEndX(swBounds.getCenterX() - parentBounds.getMinX());
            connectedWidget_.line_.setEndY(swBounds.getCenterY() - parentBounds.getMinY());
        }
    }

    void closeWidget() {
        parent_.getChildren().remove(this);
        SynthesizeApplication.widgets_.remove(this);
        SynthesizeApplication.widgetsConnectedToSpeaker_.remove(this);

        if (line_ != null) {
            parent_.getChildren().remove(line_);
        }

        connectedWidget_.parent_.getChildren().remove(connectedWidget_.line_);
    }

    public AudioComponent getAudioComponent() {
        return filterAC_;
    }

    void handleSlider(Slider slider) {
        double scale = slider.getValue();
        nameLable_.setText("    Volume Scale\n          × " + round(scale, 2));
        filterAC_.setScale_(scale);
    }

    void startConnection(MouseEvent e, Circle output) {
        if (line_ != null) {
            parent_.getChildren().remove(line_);
        }

        Bounds parentBounds = parent_.getBoundsInParent();
        Bounds bounds = output.localToScene(output.getBoundsInLocal());

        line_ = new Line();
        line_.setStyle("-fx-stroke: #808080;");
        line_.setStrokeWidth(2);
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
        Circle speaker = SynthesizeApplication.speaker_;
        Bounds speakerBounds = speaker.localToScreen(speaker.getBoundsInLocal());
        double distance = Math.sqrt(Math.pow(speakerBounds.getCenterX() - e.getScreenX(), 2.0) +
                Math.pow(speakerBounds.getCenterY() - e.getScreenY(), 2.0));

        if (distance < SPEAKER_RADIUS) {
            SynthesizeApplication.widgetsConnectedToSpeaker_.add(this);
        }
        else {
            parent_.getChildren().remove(line_);
            line_ = null;
            SynthesizeApplication.widgetsConnectedToSpeaker_.remove(this);
        }
    }

    public static double round(double value, int places) {
        if (places < 0) throw new IllegalArgumentException();

        BigDecimal bd = BigDecimal.valueOf(value);
        bd = bd.setScale(places, RoundingMode.HALF_UP);
        return bd.doubleValue();
    }
}
