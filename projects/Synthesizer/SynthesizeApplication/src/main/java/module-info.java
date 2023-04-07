module com.example.synthesizeapplication {
    requires javafx.controls;
    requires javafx.fxml;
    requires java.desktop;
    requires javafx.graphics;


    opens com.example.synthesizeapplication to javafx.fxml;
    exports com.example.synthesizeapplication;
}