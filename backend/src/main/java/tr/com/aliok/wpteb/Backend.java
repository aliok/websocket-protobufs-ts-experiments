package tr.com.aliok.wpteb;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import tr.com.aliok.wpteb.protocol.Protocol;

import javax.websocket.OnClose;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * @author Ali Ok (ali.ok@apache.org)
 *         11/08/2015 23:58
 */
@ServerEndpoint(value = "/backend", decoders = {CommandRequestDecoder.class}, encoders = {CommandAuthorizationEncoder.class})
public class Backend {
    private static final String ATTR_KEY_USERNAME = "ATTR_KEY_USERNAME";

    private static final Logger LOG = LoggerFactory.getLogger(Backend.class);

    // Backend class is stateless. that's why following two are static
    // in production code, you'd inject state!
    private static final Set<Session> sessions = Collections.synchronizedSet(new HashSet<Session>());
    private static final AtomicInteger indexOfLastUser = new AtomicInteger(0);


    @OnOpen
    public void onOpen(Session session) {
        sessions.add(session);
        LOG.info("Connected: " + session.getId() + ". Number of sessions : " + sessions.size());

        final int userIndex = indexOfLastUser.getAndIncrement();
        final String userName = "User #" + userIndex;
        session.getUserProperties().put(ATTR_KEY_USERNAME, userName);

        final Protocol.CommandAuthorization commandAuthorization = Protocol.CommandAuthorization.newBuilder()
                .setActionType(Protocol.ActionType.USER_JOIN)
                .setTime(System.currentTimeMillis())
                .setUserName(userName)
                .setUserJoinAction(Protocol.UserJoinAction.newBuilder().setUserCount(sessions.size()))
                .build();

        this.sendCommandAuthorizationToAll(commandAuthorization);
    }

    @OnMessage
    public void onTextMessage(String message, Session session) {
        LOG.info("Text message from " + session.getId() + " : " + message);
    }

    @OnMessage
    public void onBinaryMessage(Protocol.CommandRequest commandRequest, Session session) {
        LOG.info("Command request from " + session.getId() + " : " + commandRequest);

        final Protocol.ActionType actionType = commandRequest.getActionType();
        if (actionType == null) {
            LOG.error("Action type is null for received binary message! Ignoring it.");
            return;
        }

        final String userName = (String) session.getUserProperties().get(ATTR_KEY_USERNAME);
        final Protocol.CommandAuthorization.Builder builder = Protocol.CommandAuthorization.newBuilder();
        builder.setTime(System.currentTimeMillis()).setUserName(userName);

        switch (actionType) {
            case ORDER_PIZZA: {
                final Protocol.CommandAuthorization commandAuthorization = builder
                        .setActionType(Protocol.ActionType.ORDER_PIZZA)
                        .setOrderPizzaAction(commandRequest.getOrderPizzaAction())
                        .build();
                this.sendCommandAuthorizationToAll(commandAuthorization);
                break;
            }
            case PLAY_VIDEO_GAME: {
                final Protocol.CommandAuthorization commandAuthorization = builder
                        .setActionType(Protocol.ActionType.PLAY_VIDEO_GAME)
                        .setPlayVideoGameAction(commandRequest.getPlayVideoGameAction())
                        .build();
                this.sendCommandAuthorizationToAll(commandAuthorization);
                break;
            }
            case DRINK_TEA: {
                final Protocol.CommandAuthorization commandAuthorization = builder
                        .setActionType(Protocol.ActionType.DRINK_TEA)
                        .setDrinkTeaAction(commandRequest.getDrinkTeaAction())
                        .build();
                this.sendCommandAuthorizationToAll(commandAuthorization);
                break;
            }
            default: {
                LOG.error("Unknown action type " + actionType);
                return;
            }
        }
    }

    @OnClose
    public void onClose(Session session) {
        sessions.remove(session);
        LOG.info("Left: " + session.getId() + ". Number of remaining sessions : " + sessions.size());

        final String userName = (String) session.getUserProperties().get(ATTR_KEY_USERNAME);
        final Protocol.CommandAuthorization commandAuthorization = Protocol.CommandAuthorization.newBuilder()
                .setActionType(Protocol.ActionType.USER_LEAVE)
                .setTime(System.currentTimeMillis())
                .setUserName(userName)
                .setUserLeaveAction(Protocol.UserLeaveAction.newBuilder().setUserCount(sessions.size()))
                .build();

        sendCommandAuthorizationToAll(commandAuthorization);
    }

    private void sendCommandAuthorizationToAll(Protocol.CommandAuthorization commandAuthorization) {
        for (Session session : sessions) {
            this.sendCommandAuthorization(session, commandAuthorization);
        }
    }

    private void sendCommandAuthorization(Session session, Protocol.CommandAuthorization commandAuthorization) {
        // following is the sync option
        // session.getBasicRemote().sendBinary(ByteBuffer.wrap(commandAuthorization.toByteArray()));

        // btw, streaming doesn't make sense here because of async. it is not supported by async remote anyway!
        session.getAsyncRemote().sendObject(commandAuthorization);
    }

}
