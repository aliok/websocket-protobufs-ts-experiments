package tr.com.aliok.wpteb;

import com.google.protobuf.InvalidProtocolBufferException;
import com.google.protobuf.TextFormat;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import tr.com.aliok.wpteb.protocol.Protocol;

import javax.websocket.DecodeException;
import javax.websocket.Decoder;
import javax.websocket.EndpointConfig;
import java.nio.ByteBuffer;

/**
 * @author Ali Ok (ali.ok@apache.org)
 *         13/08/2015 23:18
 **/
public class CommandRequestDecoder implements Decoder.Binary<Protocol.CommandRequest> {

    private static final Logger LOG = LoggerFactory.getLogger(CommandRequestDecoder.class);

    @Override
    public Protocol.CommandRequest decode(ByteBuffer bytes) throws DecodeException {
        LOG.info("To be decoded: " + bytes);
        try {
            final Protocol.CommandRequest commandRequest = Protocol.CommandRequest.parseFrom(bytes.array());
            final String strRepresentation = TextFormat.shortDebugString(commandRequest);
            LOG.info("Decoded. Result: " + strRepresentation);
            return commandRequest;
        } catch (InvalidProtocolBufferException e) {
            LOG.error("Received a corrupt binary message: " + bytes, e);
            return null;
        }
    }

    @Override
    public boolean willDecode(ByteBuffer bytes) {
        return true;
    }

    @Override
    public void init(EndpointConfig config) {
        // do nothing
    }

    @Override
    public void destroy() {
        // do nothing
    }
}
