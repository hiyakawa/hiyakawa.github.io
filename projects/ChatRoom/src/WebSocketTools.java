import java.io.DataInputStream;
import java.io.DataOutputStream;
import java.io.IOException;
import java.net.Socket;
import java.text.SimpleDateFormat;

public class WebSocketTools {
    private Socket clientSocket_;
    private String message_;
    private String roomName_;
    private long payloadLength_;
    byte[] decoded_;

    public WebSocketTools(Socket clientSocket) {
        clientSocket_ = clientSocket;
    }

    public void readWsRequest() throws IOException {
        DataInputStream dis = new DataInputStream(clientSocket_.getInputStream());
        byte[] ArrayFirstTwoBytes = new byte[2];
        dis.readNBytes(ArrayFirstTwoBytes, 0, 2);

        boolean isFin = (ArrayFirstTwoBytes[0] & 0x80) != 0;
        byte opcode = (byte) (ArrayFirstTwoBytes[0] & 0x0F);
        boolean isMasked = (ArrayFirstTwoBytes[1] & 0x80) != 0;

        int length = ArrayFirstTwoBytes[1] & 0x7F;
        if (length < 126) {
            payloadLength_ = length;
        }
        else if (length == 126) {
            payloadLength_ = dis.readShort();
        }
        else {
            payloadLength_ = dis.readLong();
        }

        byte[] maskingKey = null;
        if (isMasked) {
            maskingKey = new byte[4];
            dis.readNBytes(maskingKey, 0, 4);
        }

        byte[] payload = new byte[(int) payloadLength_];
        dis.readNBytes(payload, 0, (int) payloadLength_);
        decoded_ = new byte[(int) payloadLength_];

        if (isMasked) {
            for (int i = 0; i < payloadLength_; i++) {
                decoded_[i] = ((byte) (payload[i] ^ maskingKey[i % 4]));
            }
        }

        message_ = new String(decoded_);
    }

    public String getJsonMessage() {
        String userName;
        String chatRoom;
        String jsonStr;
        String timeStamp = new SimpleDateFormat("HH:mm").format(new java.util.Date());
        String payloadType = null;

        if (message_.length() > 0) {
            payloadType = message_.split(" ", 2)[0];
        }

        if (payloadType != null) {
            if (!payloadType.equals("join") && (!payloadType.equals("leave"))) {
                payloadType = "message";
                userName = message_.split(" ", 2)[0];
                try {
                    String payLoadMessage = message_.split(" ", 2)[1];

                    jsonStr = "{\"type\": \"" + payloadType +
                            "\", \"user\": \"" + userName +
                            "\", \"room\": \"" + roomName_ +
                            "\", \"time stamp\": \"" + timeStamp +
                            "\", \"message\": \"" + payLoadMessage + "\"}";
                    System.out.println(jsonStr);
                }
                catch (Exception e) {
                    System.out.println("client leaves the chat room");
                    return null;
                }
            }
            else {
                userName = message_.split(" ", 3)[1];
                chatRoom = message_.split(" ", 3)[2];
                roomName_ = chatRoom;
                Room room = Room.getRoom(roomName_);
                room.addClient( clientSocket_ );

                jsonStr = "{\"type\": \"" + payloadType +
                        "\", \"user\": \"" + userName +
                        "\", \"room\": \"" + roomName_ +
                        "\", \"time stamp\": \"" + timeStamp + "\"}";
                System.out.println(jsonStr);
            }
            return jsonStr;
        }
        return null;
    }

    public void respondWsRequest() throws IOException {
        String jsonMsg = getJsonMessage();
        Room room = Room.getRoom(roomName_);

        for (Socket socket : room.getClients()) {
            DataOutputStream dos = new DataOutputStream(socket.getOutputStream());
            dos.writeByte(0x81);
            byte payloadLength = (byte) jsonMsg.length();
            dos.writeByte(payloadLength);
            dos.write(jsonMsg.getBytes());
            dos.flush();
        }
    }
}