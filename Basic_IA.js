/*!
 * BikeWar Javascript BAsic IA
 * http://www.codeofwar.net
 *
 *
 * Copyright 2014 Tamina
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 * author : david mouton
 */

/**
 * Le nom de l'IA
 * @property name
 * @type String
 */
var name = "Id.iot";


var color = 0;

/**
 * Le message à sortir dans la console à la fin du tour
 * @property debugMessage
 * @type String
 */
var debugMessage = "";

/**
 * Id de l'IA
 * @property id
 * @type String
 */
var id = 0;


onmessage = function (event) {
    if (event.data != null) {
        var turnMessage = event.data;
        id = turnMessage.playerId;
        var orders = [];
        var msg = "";
        try {
            orders = getOrders(turnMessage.data);
            msg = debugMessage;
        } catch (e) {
            msg = 'Error : ' + e;
        }
        postMessage(new TurnResult(orders, msg));
    }
    else postMessage("data null");
};


var _turnNum = 1;
var _movingTruckId = new Array();

/**
 * Cette méthode est appelée par le système tout les tours
 * @method getOrders
 * @param    context {MapData} l'ensemble des données de la partie
 * @return    result {Array<Order>} la liste des ordres à exécuter ce tour
 */
var getOrders = function (context) {
    var result = new Array();
    var _g1 = 0;
    var _g = context.trucks.length;
    while(_g1 < _g) {
        var i = _g1++;
        var truck = context.trucks[i];
        if(truck.owner.id == this.id && truck.currentStation != null) {
            if(this._movingTruckId.indexOf(truck.id) > -1) {
                HxOverrides.remove(this._movingTruckId,truck.id);
                if(truck.currentStation.bikeNum < truck.currentStation.slotNum / 4) {
                    if(truck.bikeNum > 0) result.push(new UnLoadingOrder(truck.id,truck.currentStation.id,1));
                } else if(truck.currentStation.bikeNum > truck.currentStation.slotNum / 4 * 3) {
                    if(truck.bikeNum < Game.TRUCK_NUM_SLOT) result.push(new LoadingOrder(truck.id,truck.currentStation.id,1));
                } else if(GameUtils.hasStationEnoughBike(truck.currentStation)) {
                    if(truck.bikeNum < Game.TRUCK_NUM_SLOT) result.push(new LoadingOrder(truck.id,truck.currentStation.id,1));
                }
            } else {
                this._movingTruckId.push(truck.id);
                result.push(new MoveOrder(truck.id,context.stations[Math.round(Math.random() * context.stations.length)].id));
            }
        } else {
        }
    }
    this._turnNum++;
    return result;
};

/**
 * La Map
 * <br/> Contient l'ensemble des données de la partie
 * @class MapData
 * @constructor
 */
var MapData = function () {
    /**
     * La liste des joueurs
     * @property players
     * @type Array<Player>
     */
    this.players = [];

    /**
     * La liste des stations de vélo
     * @property stations
     * @type Array<BikeStation>
     */
    this.stations = [];

    /**
     * La liste des camions
     * @property trucks
     * @type Array<Truck>
     */
    this.trucks = [];

    /**
     * La date courante
     * @property currentTime
     * @type Date
     */
    this.currentTime = new Date();

    /**
     * La liste des routes
     * @property roads
     * @type Array<Junction>
     */
    this.roads = [];
};

/**
 * Station de Vélo
 * @class BikeStation
 * @constructor
 */
var BikeStation = function () {
    /**
     * L'id de la station
     * @property id
     * @type Float
     */
    this.id = 0.0;

    /**
     * Le nombre de vélo
     * @property bikeNum
     * @type Int
     */
    this.bikeNum = 0;

    /**
     * Le nombre d'emplacement pour vélo
     * @property slotNum
     * @type Int
     */
    this.slotNum = 0;

    /**
     * La position de la station sur la Map
     * @property position
     * @type Junction
     */
    this.position = null;

    /**
     * Le proprietaire
     * @property owner
     * @type Player
     */
    this.owner = null;

    /**
     * Le profil de la station.
     * le nombre moyen de vélo en station entre 00h00 et 23h45, toutes les 15 minutes.
     * @property profile
     * @type Array<Int>
     */
    this.profile = [];

    /**
     * Le nom de la station
     * @property name
     * @type String
     */
    this.name = '';

};

/**
 * Classe de base des Ordres à éxécuter par le systeme
 * @class Order
 */
var Order = function (truckId, targetStationId, type) {
    /**
     * L'id du camion concerné par cet ordre
     * @property truckId
     * @type Float
     * @static
     */
    this.truckId = truckId;

    /**
     * La station concernée par cet ordre
     * @property targetStationId
     * @type Float
     * @static
     */
    this.targetStationId = targetStationId;

    /**
     * Le type d'ordre cet ordre. Voir {{#crossLink "OrderType"}} OrderType {{/crossLink}}
     * @property type
     * @type String
     * @static
     */
    this.type = type;
};

/**
 * Ordre de déplacement
 * @class MoveOrder
 * @constructor
 * @param    truckId  {Float} L'id du camion concerné par cet ordre
 * @param    targetStationId {Float} La station de destination
 */
var MoveOrder = function (truckId, targetStationId) {
    MoveOrder.prototype = Object.create(Order.prototype);
    Order.apply(this, [truckId, targetStationId, OrderType.MOVE]);
};

/**
 * Ordre de chargement
 * @class LoadingOrder
 * @constructor
 * @param    truckId  {Float} L'id du camion concerné par cet ordre
 * @param    targetStationId {Float} La station de destination
 * @param    bikeNum {Int} Le nombre de vélo à charger
 */
var LoadingOrder = function (truckId, targetStationId, bikeNum) {
    LoadingOrder.prototype = Object.create(Order.prototype);
    Order.apply(this, [truckId, targetStationId, OrderType.LOAD]);

    /**
     * Le nombre de vélo à charger
     * @property bikeNum
     * @type Int
     */
    this.bikeNum = bikeNum;
};

/**
 * Ordre de déchargement des vélos
 * @class UnLoadingOrder
 * @constructor
 * @param    truckId  {Float} L'id du camion concerné par cet ordre
 * @param    targetStationId {Float} La station ciblée
 * @param    bikeNum {Int} Le nombre de vélo à décharger
 */
var UnLoadingOrder = function (truckId, targetStationId, bikeNum) {
    UnLoadingOrder.prototype = Object.create(Order.prototype);
    Order.apply(this, [truckId, targetStationId, OrderType.UNLOAD]);

    /**
     * Le nombre de vélo à décharger
     * @property bikeNum
     * @type Int
     */
    this.bikeNum = bikeNum;
};

/**
 * Enumeration des types d'ordres
 * @class OrderType
 */
var OrderType = {

    /**
     * Ordre de déplacement
     * @property MOVE
     * @type String
     */
    MOVE: "move",

    /**
     * Ordre de chargement de vélo
     * @property LOAD
     * @type String
     */
    LOAD: "load",

    /**
     * Ordre de déchargement de vélo
     * @property UNLOAD
     * @type String
     */
    UNLOAD: "unload",

    /**
     * Ordre de rien du tout
     * @property NONE
     * @type String
     */
    NONE: "none"
};


/**
 * Joueur
 * @class Player
 * @constructor
 * @param    name {String}
 * @param    color {String}
 * @param    script {String}
 */
var Player = function (name, script, color) {
    /**
     * Le nom de l'IA
     * @property name
     * @type String
     */
    this.name = name;
    this.script = script;
    this.color = color;

    /**
     * Id de l'IA
     * @property id
     * @type String
     */
    this.id = UID.get();
};


var TurnMessage = function (playerId, galaxy) {
    this.playerId = playerId;
    this.galaxy = galaxy;
};


var TurnResult = function (orders, message) {
    if (message == null) message = "";
    this.orders = orders;
    this.consoleMessage = message;
    this.error = "";
};

/**
 * @class Point
 * @param x:Number
 * @param y:Number
 */
var Point = function (x, y) {
    this.x = x;
    this.y = y;
};

/**
 * @class Junction
 * @extends Point
 * @param x:Number
 * @param y:Number
 * @param id:String
 */
var Junction = function (x, y, id) {
    Junction.prototype = Object.create(Point.prototype);
    Order.apply(this, [x,y]);
    /**
     * La liste des Junction liées
     * @property links
     * @type Array<Junction>
     */
    this.links = [];
    this.id = id;


    this.bikeNum = bikeNum;
};

/**
 * Tendance d'une Station
 * @class Trend
 */
var Trend = {

    /**
     * Décroissante
     * @property DECREASE
     * @type Int
     * @default -1
     * @static
     */
    DECREASE: -1,

    /**
     * Croissante
     * @property INCREASE
     * @type Int
     * @default 1
     * @static
     */
    INCREASE: 1,

    /**
     * Stable
     * @property STABLE
     * @type Int
     * @default 0
     * @static
     */
    STABLE: 0

};

/**
 * Camion
 * @class Truck
 */
var Truck = function(owner,currentStation) {

    /**
     * L'Id du camion
     * @property id
     * @type Float
     */
    this.id= UID.get();

    /**
     * Le proprietaire du camion
     * @property owner
     * @type Player
     */
    this.owner = owner;

    /**
     * Le nombre de vélo embarqué
     * @property bikeNum
     * @type Int
     */
    this.bikeNum=0;

    /**
     * La position du camion
     * @property position
     * @type Point
     */
    this.position=currentStation.position;

    /**
     * Si il s'y trouve, la station actuelle.
     * @property currentStation
     * @type BikeStation
     */
    this.currentStation=currentStation;

}

/**
 * Classe utilitaire
 * @class GameUtils
 */
var GameUtils = {};
/**
 * Indique le nombre de tour necessaire à un camion pour rejoindre une station
 * @method getTravelDuration
 * @param	source {Truck} le camion
 * @param   target {BikeStation} la station de destination
 * @return	result {Int} le nombre de tour
 * @static
 */
GameUtils.getTravelDuration = function (source, target){
    var result = 1000;
    result = Math.ceil( GameUtil.getDistanceBetween( source.position, target.position) / Game.TRUCK_SPEED);
    return result;
}

/**
 * Détermine la distance qui sépare deux Points en pixel
 * @method getDistanceBetween
 * @param	p1 {Point} le point d'origine
 * @param   p2 {Point} le point de destination
 * @return	result {Int} le nombre de pixel
 * @static
 */
GameUtils.getDistanceBetween = function ( p1, p2 )
{
    return Math.sqrt( Math.pow( ( p2.x - p1.x ), 2 ) + Math.pow( ( p2.y - p1.y ), 2 ) );
}

/**
 * Si la station se trouve dans sa zone optimale
 * @method hasStationEnoughBike
 * @param	station {BikeStation} la station
 * @return	result {Bool}
 * @static
 */
GameUtils.hasStationEnoughBike = function (station){
    return (station.bikeNum > station.slotNum/4 && station.bikeNum < station.slotNum/4*3);
}

/**
 * Récupere le chemin le plus court entre deux stations
 * @method getPath
 * @param	fromStation {BikeStation} la station d'origine
 * @param   toStation {BikeStation} la station de destination
 * @param   map {MapData} la map
 * @return	result {Path} le chemin
 * @static
 */
GameUtils.getPath = function (fromStation,toStation, map){
    var p = new PathFinder();
    return p.getPath(fromStation,toStation,map);
}

/**
 * Indique la tendance d'une station à un instant particulier
 * @method getBikeStationTrend
 * @param	target {BikeStation} la station
 * @param   time {Date} l'heure de la journée
 * @return	result {Trend} la tendance
 * @static
 */
GameUtils.getBikeStationTrend = function (target, time ){
    var currentIndex = time.getHours() * 4 +  Math.floor(  time.getMinutes() * 4 / 60 ) ;
    var nextIndex = currentIndex + 1;
    if(nextIndex + 1 > target.profile.length){
        nextIndex = 0;
    }
    return target.profile[nextIndex] - target.profile[currentIndex];
}

/**
 * Classe utilitaire
 * @internal
 */
var UID = {};
UID.lastUID = 0;
UID.get = function () {
    UID.lastUID++;
    return UID.lastUID;
}

/**
 * Constantes du jeu
 * @class Game
 */
var Game = {};
/**
 * La vitesse d'execution d'un tour.
 * @property GAME_SPEED
 * @type Int
 * @static
 */
Game.GAME_SPEED = 1000;
/**
 * Le nombre maximum de tour
 * @property GAME_MAX_NUM_TURN
 * @type Int
 * @static
 */
Game.GAME_MAX_NUM_TURN = 500;
/**
 * La vitesse d'un camion
 * @property TRUCK_SPEED
 * @type Int
 * @static
 */
Game.TRUCK_SPEED = 60;
/**
 * La capacité d'un camion
 * @property TRUCK_NUM_SLOT
 * @type Int
 * @static
 */
Game.TRUCK_NUM_SLOT = 10;
/**
 * La durée maximale du tour d'une IA. Si l'IA dépasse cette durée, elle passe en timeout.
 * @property MAX_TURN_DURATION
 * @type Int
 * @static
 */
Game.MAX_TURN_DURATION = 1000;
/**
 * La durée d'un tour en ms. ex 15 minutes/tours
 * @property TURN_TIME
 * @type Int
 * @static
 */
Game.TURN_TIME = 1000*30*15;

var PathFinder = function() {
    this._inc = 0;
    this._paths = new Array();
};
PathFinder.__name__ = true;
PathFinder.prototype = {
    getPath: function(fromStation,toStation,map) {
        this._map = map;
        this._source = this.getJunctionByStation(fromStation);
        this._target = this.getJunctionByStation(toStation);
        var p = new Path();
        p.push(this._source);
        this._paths.push(p);
        this.find();
        return this._result;
    }
    ,getJunctionByStation: function(station) {
        var result = null;
        var _g1 = 0;
        var _g = this._map.roads.length;
        while(_g1 < _g) {
            var i = _g1++;
            var j = this._map.roads[i];
            if(j.x == station.position.x && j.y == station.position.y) {
                result = j;
                break;
            }
        }
        return result;
    }
    ,find: function() {
        var result = false;
        this._inc++;
        var paths = this._paths.slice();
        var _g1 = 0;
        var _g = paths.length;
        while(_g1 < _g) {
            var i = _g1++;
            if(this.checkPath(paths[i])) {
                result = true;
                break;
            }
        }
        if(!result && this._inc < 50) this.find();
    }
    ,checkPath: function(target) {
        var result = false;
        var currentJunction = target.getLastItem();
        var _g1 = 0;
        var _g = currentJunction.links.length;
        while(_g1 < _g) {
            var i = _g1++;
            var nextJunction = currentJunction.links[i];
            if(nextJunction.id == this._target.id) {
                result = true;
                var p = target.copy();
                p.push(nextJunction);
                this._result = p;
                break;
            } else if(!Path.contains(nextJunction,this._paths)) {
                var p1 = target.copy();
                p1.push(nextJunction);
                this._paths.push(p1);
            }
        }
        HxOverrides.remove(this._paths,target);
        return result;
    }
    ,checkPathDirection: function(currentJunction) {
        var result = true;
        if(this._inc > 2) {
            if(this._source.x < this._target.x && currentJunction.x < this._source.x) result = false; else if(this._source.x > this._target.x && currentJunction.x > this._target.x) result = false;
        }
        return result;
    }
};

var Path = function(content) {
    if(content == null) this._content = new Array(); else this._content = content;
};
Path.__name__ = true;
Path.contains = function(item,list) {
    var result = false;
    var _g1 = 0;
    var _g = list.length;
    while(_g1 < _g) {
        var i = _g1++;
        if(list[i].hasItem(item)) {
            result = true;
            break;
        }
    }
    return result;
};
Path.prototype = {
    getLastItem: function() {
        return this._content[this._content.length - 1];
    }
    ,hasItem: function(item) {
        var result = false;
        var _g1 = 0;
        var _g = this._content.length;
        while(_g1 < _g) {
            var i = _g1++;
            if(item.id == this._content[i].id) {
                result = true;
                break;
            }
        }
        return result;
    }
    ,getGuide: function() {
        var result = new Array();
        var _g1 = 0;
        var _g = this._content.length;
        while(_g1 < _g) {
            var i = _g1++;
            result.push(this._content[i].x - 8);
            result.push(this._content[i].y - 8);
        }
        return result;
    }
    ,getItemAt: function(index) {
        return this._content[index];
    }
    ,push: function(item) {
        this._content.push(item);
    }
    ,remove: function(item) {
        return HxOverrides.remove(this._content,item);
    }
    ,copy: function() {
        return new com.tamina.bikewar.data.Path(this._content.slice());
    }
    ,get_length: function() {
        return this._content.length;
    }
};

var HxOverrides = function() { };
HxOverrides.__name__ = true;
HxOverrides.indexOf = function(a,obj,i) {
    var len = a.length;
    if(i < 0) {
        i += len;
        if(i < 0) i = 0;
    }
    while(i < len) {
        if(a[i] === obj) return i;
        i++;
    }
    return -1;
};
HxOverrides.remove = function(a,obj) {
    var i = HxOverrides.indexOf(a,obj,0);
    if(i == -1) return false;
    a.splice(i,1);
    return true;
};



