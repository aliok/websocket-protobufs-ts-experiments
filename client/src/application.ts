/// <reference path="../typings/tsd.d.ts" />
/// <reference path="../proto-typings/protocol.proto.d.ts" />

import CommandAuthorization = tr.com.aliok.wpteb.protocol.CommandAuthorization;
import CommandRequest = tr.com.aliok.wpteb.protocol.CommandRequest;
import ActionType = tr.com.aliok.wpteb.protocol.ActionType;
import UserJoinAction = tr.com.aliok.wpteb.protocol.UserJoinAction;
import UserLeaveAction = tr.com.aliok.wpteb.protocol.UserLeaveAction;
import OrderPizzaAction = tr.com.aliok.wpteb.protocol.OrderPizzaAction;
import PlayVideoGameAction = tr.com.aliok.wpteb.protocol.PlayVideoGameAction;
import DrinkTeaAction = tr.com.aliok.wpteb.protocol.DrinkTeaAction;

$(function () {

    var content:JQuery = $('#content');
    var connection:WebSocket = null;

    var dcodeIO = <any>window['dcodeIO'];
    var ProtoBuf = dcodeIO.ProtoBuf;

    var protocol = ProtoBuf.loadProtoFile("./protocol.proto");

    //TODO: is it necessary to build everything one by one?
    var CommandAuthorizationBuilder:tr.com.aliok.wpteb.protocol.CommandAuthorizationBuilder = protocol.build("tr.com.aliok.wpteb.protocol.CommandAuthorization");
    var CommandRequestBuilder:tr.com.aliok.wpteb.protocol.CommandRequestBuilder = protocol.build("tr.com.aliok.wpteb.protocol.CommandRequest");
    var UserJoinActionBuilder:tr.com.aliok.wpteb.protocol.UserJoinActionBuilder = protocol.build("tr.com.aliok.wpteb.protocol.UserJoinAction");
    var UserLeaveActionBuilder:tr.com.aliok.wpteb.protocol.UserLeaveActionBuilder = protocol.build("tr.com.aliok.wpteb.protocol.UserLeaveAction");
    var OrderPizzaActionBuilder:tr.com.aliok.wpteb.protocol.OrderPizzaActionBuilder = protocol.build("tr.com.aliok.wpteb.protocol.OrderPizzaAction");
    var PlayVideoGameActionBuilder:tr.com.aliok.wpteb.protocol.PlayVideoGameActionBuilder = protocol.build("tr.com.aliok.wpteb.protocol.PlayVideoGameAction");
    var DrinkTeaActionBuilder:tr.com.aliok.wpteb.protocol.DrinkTeaActionBuilder = protocol.build("tr.com.aliok.wpteb.protocol.DrinkTeaAction");

    connection = new WebSocket("ws://" + window.location.hostname + ":8080/backend");
    connection.binaryType = 'arraybuffer';

    $(document).ready(function () {
        $('#orderPizza').click(function () {
            var commandRequest:CommandRequest = new CommandRequestBuilder();
            commandRequest.setActionType(ActionType.ORDER_PIZZA);

            var orderPizzaAction:OrderPizzaAction = new OrderPizzaActionBuilder();
            orderPizzaAction.setPizzaName(['Vegetariana', 'Margherita', 'Funghi'][Math.floor(Math.random() * 3)]);
            orderPizzaAction.setCount(Math.floor(Math.random() * 10) + 1);

            commandRequest.setOrderPizzaAction(orderPizzaAction);

            sendMessage(commandRequest);
        });

        $('#playVideoGame').click(function () {
            var commandRequest = new CommandRequestBuilder();
            commandRequest.setActionType(ActionType.PLAY_VIDEO_GAME);

            var playVideoGameAction = new PlayVideoGameActionBuilder();
            playVideoGameAction.setVideoGameName(['WOW', 'AOE II: AOK', 'Candy Crap'][Math.floor(Math.random() * 3)]);
            playVideoGameAction.setPlayers(Math.floor(Math.random() * 10) + 1);

            commandRequest.setPlayVideoGameAction(playVideoGameAction);

            sendMessage(commandRequest);
        });

        $('#drinkTea').click(function () {
            var commandRequest = new CommandRequestBuilder();
            commandRequest.setActionType(ActionType.DRINK_TEA);

            var drinkTeaAction = new DrinkTeaActionBuilder();
            drinkTeaAction.setRegion(['Turkish Black Sea', 'India', 'Africa'][Math.floor(Math.random() * 3)]);
            drinkTeaAction.setTemperature(Math.floor(Math.random() * 80) + 1);

            commandRequest.setDrinkTeaAction(drinkTeaAction);

            sendMessage(commandRequest);
        });
    });

    // Prevent ESC to kill the connection from Firefox.
    $(window).keypress(function (e) {
        if (e.keyCode === 27) {
            e.preventDefault();
        }
    });

    connection.onopen = function (event) {
        content.html("<p>Websocket connected</p>");
    };

    connection.onmessage = function (event) {
        var data = event.data;

        var dataAsArray = new Uint8Array(data);

        console.log("Received data. Binary and text representations are: ", dataAsArray, String.fromCharCode.apply(null, dataAsArray));

        handleMessage(data);

        //var date = typeof(json.time) == 'string' ? parseInt(json.time) : json.time;
        //showMessage(json.author, json.message, me ? 'blue' : 'black', new Date(date));
    };

    connection.onclose = function (event) {
        content.html("<p>Connection closed</p>");
    };

    connection.onerror = function (event) {
        content.html("<p>Sorry, but there's some problem with your socket or the server is down</p>");
    };

    var sendMessage = function (commandRequest:CommandRequest) {
        console.log('sendMessage', commandRequest);
        if (connection.readyState === WebSocket.OPEN) {
            connection.send(commandRequest.toArrayBuffer());
        }
        else {
            console.log('Connection closing, closed or not yet ready!')
        }
    };

    function handleMessage(data) {
        var commandAuthorization:CommandAuthorization = CommandAuthorizationBuilder.decode(data);

        console.log("Received message.");
        console.log(commandAuthorization.toString);

        var user = commandAuthorization.userName;
        // time received from proto buf is a "long.js" long
        // let's convert it to nearest number approximation
        // following will fail in year 2038
        var timeMsec = (<any>commandAuthorization.time).toNumber();
        var date = new Date(timeMsec);

        switch (commandAuthorization.actionType) {
            case ActionType.USER_JOIN:
            {
                var userCount = commandAuthorization.userJoinAction.userCount;
                showMessage(user, "Joined... Logged in users:" + userCount, "green", date);
                break;
            }
            case ActionType.USER_LEAVE:
            {
                var userCount = commandAuthorization.userLeaveAction.userCount;
                showMessage(user, "Left... Logged in users: " + userCount, "red", date);
                break;
            }
            case ActionType.ORDER_PIZZA:
            {
                var pizzaName = commandAuthorization.orderPizzaAction.pizzaName;
                var count = commandAuthorization.orderPizzaAction.count;
                showMessage(user, "Ordered " + count + " " + pizzaName + " pizza(s).", "blue", date);
                break;
            }
            case ActionType.PLAY_VIDEO_GAME:
            {
                var videoGameName = commandAuthorization.playVideoGameAction.videoGameName;
                var players = commandAuthorization.playVideoGameAction.players;
                showMessage(user, "Playing " + videoGameName + " with " + players + " player(s).", "blue", date);
                break;
            }
            case ActionType.DRINK_TEA:
            {
                var region = commandAuthorization.drinkTeaAction.region;
                var temperature = commandAuthorization.drinkTeaAction.temperature;
                showMessage(user, "Drinking tea from " + region + " at " + temperature + " degree(s) Celcius.", "blue", date);
                break;
            }
            default:
            {
                showMessage(user, "Unknown action with type " + commandAuthorization.actionType + ".", "red", new Date());
            }
        }
    }

    function showMessage(author, message, color, datetime) {
        content.append('<p><span style="text-decoration: underline; color:' + color + '">' + author + '</span> @ ' + datetime + ': ' + "<br/>" + message + '</p>');
    }
});

