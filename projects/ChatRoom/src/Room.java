import java.net.Socket;
import java.util.ArrayList;
import java.util.HashMap;

public class Room {
    private String roomName_;
    private ArrayList<Socket> connectedSockets_ = new ArrayList<>();
    private static HashMap<String, Room> rooms_ = new HashMap<>();

    private Room(String roomName) {
        roomName_ = roomName;
    }

    public synchronized static Room getRoom(String roomName) {
        if (rooms_.containsKey(roomName)) {
            return rooms_.get(roomName);
        }
        else {
            Room room = new Room(roomName);
            rooms_.put(roomName, room);
            return room;
        }
    }

    public synchronized void addClient(Socket client) {
        connectedSockets_.add(client);
    }

    public ArrayList<Socket> getClients() {
        return connectedSockets_;
    }
}