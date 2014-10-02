// Cross-browser version of `requestAnimationFrame`.
// Falls back to other functions and settimeout for
// older browsers.
window.requestAnimFrame = (function(){
  return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function(/* function */ callback, /* DOMElement */ element){
      window.setTimeout(callback, 1000 / 60);
    };
})();

var canvas = document.getElementById("c");
var ctx = canvas.getContext("2d");

var world;

function init() {

  var b2Vec2 = Box2D.Common.Math.b2Vec2
    , b2BodyDef = Box2D.Dynamics.b2BodyDef
    , b2Body = Box2D.Dynamics.b2Body
    , b2FixtureDef = Box2D.Dynamics.b2FixtureDef
    , b2Fixture = Box2D.Dynamics.b2Fixture
    , b2World = Box2D.Dynamics.b2World
    , b2MassData = Box2D.Collision.Shapes.b2MassData
    , b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
    , b2CircleShape = Box2D.Collision.Shapes.b2CircleShape
    , b2DebugDraw = Box2D.Dynamics.b2DebugDraw
    ;

  // Create the Box2D world. First arg is gravity in x and y, second
  // tells Box2D to sleep inactive objects.
  world = new b2World(new b2Vec2(0, 15), true);

  // Scale between Box2D units and pixels. (PPM, pixels per meter)
  var SCALE = 30;

  // -------------------------------------------------
  // Create the ground
  // -------------------------------------------------
  var fixDef = new b2FixtureDef;
  fixDef.density = 1.0;
  fixDef.friction = 0.5;
  // No bounce for you! Come back one year!
  fixDef.restitution = 0.0;

  var bodyDef = new b2BodyDef;
  bodyDef.type = b2Body.b2_staticBody;

  // positions the center of the object (not upper left!)
  bodyDef.position.x = canvas.width / 2 / SCALE;
  bodyDef.position.y = canvas.height / SCALE;
  fixDef.shape = new b2PolygonShape;

  // half width, half height. eg actual height here is 1 unit
  fixDef.shape.SetAsBox((600 / SCALE) / 2, (10/SCALE) / 2);
  world.CreateBody(bodyDef).CreateFixture(fixDef);

  // -------------------------------------------------
  // Create Player 1, who's body is a half circle
  // -------------------------------------------------
  var vertexArray = []
    , rad
    , x
    , y;
  // Calculate the points along an arc, and add them
  // as vertices
  for(var deg = 180; deg <= 360; deg += 2) {
    rad = deg * Math.PI / 180;
    x = Math.cos(rad);
    y = Math.sin(rad);
    vertexArray.push(new b2Vec2(x, y));
  }

  fixDef.shape.SetAsArray(vertexArray);

  bodyDef.position.x = canvas.width / 2 / SCALE;
  bodyDef.position.y = canvas.height / 2 / SCALE;
  bodyDef.type = b2Body.b2_dynamicBody;

  // Make the player body frictionless
  var player1Body = world.CreateBody(bodyDef);
  player1Body.CreateFixture(fixDef).SetFriction(0);

  // -------------------------------------------------
  // Input
  // -------------------------------------------------
  document.addEventListener('keydown', function(event) {
    var currentVelocity =  player1Body.GetLinearVelocity();
    // Pressed W (jump)
    // TODO Only jump when touching the ground
    if(event.keyCode == 87) {
      player1Body.ApplyImpulse(new b2Vec2(0, -12), player1Body.GetWorldCenter());

    }
    // Pressed D (right)
    if(event.keyCode == 68) {
      // Seems like SetLinearVelocity isn't waking the body for some
      // reason (?)
      player1Body.SetAwake(true);
      player1Body.SetLinearVelocity(new b2Vec2(10, currentVelocity.y));
    }
    // Pressed D (right)
    if(event.keyCode == 65) {
      player1Body.SetAwake(true);
      player1Body.SetLinearVelocity(new b2Vec2(-10, currentVelocity.y));
    }
  });

  document.addEventListener('keyup', function(event) {
    var currentVelocity =  player1Body.GetLinearVelocity();
    // Released D (right)
    if(event.keyCode == 68) {
      player1Body.SetAwake(true);
      player1Body.SetLinearVelocity(new b2Vec2(0, currentVelocity.y));
    }
    // Released A (left)
    if(event.keyCode == 65) {
      player1Body.SetAwake(true);
      player1Body.SetLinearVelocity(new b2Vec2(0, currentVelocity.y));
    }
  });

  // -------------------------------------------------
  // Setup debug draw
  // -------------------------------------------------
  var debugDraw = new b2DebugDraw();
  debugDraw.SetSprite(document.getElementById("c").getContext("2d"));
  debugDraw.SetDrawScale(SCALE);
  debugDraw.SetFillAlpha(0.3);
  debugDraw.SetLineThickness(1.0);
  debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
  world.SetDebugDraw(debugDraw);
}; // init()

function update() {
  world.Step(
    1 / 60, //frame-rate
    8, //velocity iterations
    3 //position iterations
  );
  world.DrawDebugData();
  world.ClearForces();
  requestAnimFrame(update);
}; // update()

init();
requestAnimFrame(update);
