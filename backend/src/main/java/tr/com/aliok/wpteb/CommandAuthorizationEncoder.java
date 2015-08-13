package tr.com.aliok.wpteb;

import tr.com.aliok.wpteb.protocol.Protocol;

import javax.websocket.EncodeException;
import javax.websocket.Encoder;
import javax.websocket.EndpointConfig;
import java.nio.ByteBuffer;

/**
 * @author Ali Ok (ali.ok@apache.org)
 *         13/08/2015 23:18
 **/
public class CommandAuthorizationEncoder implements Encoder.Binary<Protocol.CommandAuthorization> {
    @Override
    public ByteBuffer encode(Protocol.CommandAuthorization object) throws EncodeException {
        return ByteBuffer.wrap(object.toByteArray());
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
