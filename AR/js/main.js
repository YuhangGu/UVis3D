var scene, camera, renderer, clock, deltaTime, totalTime;

var arToolkitSource, arToolkitContext;


var dataSourceName;

const conf = {

    'Utrecht': [
        ['Utrecht', 'height', 'out', 'A', 'map-training'],
        ['Utrechtse Heuvelrug', 'height', 'out', 'B', 'map-training'],
        ['Amersfoort', 'width', 'in', 'C', 'map-training'],
        ['Zeist', 'width', 'in', 'D', 'map-training']
    ],
    'Friesland': [
        ['Leeuwarden', 'height', 'out', 'A', 'map-1'],
        ['Súdwest-Fryslân', 'height', 'in', 'B', 'map-2'],
        ['Tytsjerksteradiel', 'width', 'out', 'C', 'map-3'],
        ['Heerenveen', 'width', 'in', 'D', 'map-4']
    ],
    'Groningen': [
        ['Groningen', 'height', 'out', 'A', 'map-5'],
        ['Loppersum', 'height', 'in', 'B', 'map-6'],
        ['Oldambt', 'width', 'out', 'C', 'map-7'],
        ['Zuidhorn', 'width', 'out', 'D', 'map-8']
    ]
}


function visARstart(dataPathName) {

    dataSourceName = dataPathName;

    initTHREEComponets();

    loadData(dataPathName, function() {

        prepareVis(function() {
            initialize();
            animate();
        });

    });

}

function initTHREEComponets() {

    scene = new THREE.Scene();

    let ambientLight = new THREE.AmbientLight("#f0f0f0", 0.5);
    scene.add(ambientLight);

    var directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(0, 0, 1).normalize();
    scene.add(directionalLight);

    camera = new THREE.Camera();

    scene.add(camera);

    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });
    renderer.setClearColor(new THREE.Color('lightgrey'), 0)
    renderer.setSize(1600, 1200);
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0px';
    renderer.domElement.style.left = '0px';
    document.body.appendChild(renderer.domElement);

    clock = new THREE.Clock();
    deltaTime = 0;
    totalTime = 0;

    ////////////////////////////////////////////////////////////
    // setup arToolkitSource
    ////////////////////////////////////////////////////////////

    arToolkitSource = new THREEx.ArToolkitSource({
        sourceType: 'webcam',
    });

    function onResize() {
        arToolkitSource.onResize();
        arToolkitSource.copySizeTo(renderer.domElement);
        if (arToolkitContext.arController !== null) {
            arToolkitSource.copySizeTo(arToolkitContext.arController.canvas)
        }
    }

    arToolkitSource.init(function onReady() {
        onResize()
    });

    // handle resize event
    window.addEventListener('resize', function() {
        onResize()
    });

    ////////////////////////////////////////////////////////////
    // setup arToolkitContext
    ////////////////////////////////////////////////////////////

    // create atToolkitContext
    arToolkitContext = new THREEx.ArToolkitContext({
        cameraParametersUrl: 'data/camera_para.dat',
        detectionMode: 'mono'
    });

    // copy projection matrix to camera when initialization complete
    arToolkitContext.init(function onCompleted() {
        camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
    });

}

function initialize() {


    ////////////////////////////////////////////////////////////
    // setup markerRoots
    ////////////////////////////////////////////////////////////

    let patternArray = ["letterA", "letterB", "letterC", "letterD"];
    //let colorArray = [0xff0000, 0xff8800, 0xffff00, 0x00cc00, 0x0000ff, 0xcc00ff, 0xcccccc];

    var confString = "conf." + dataSourceName;


    for (let i = 0; i < 4; i++) {

        let markerRoot = new THREE.Group();

        scene.add(markerRoot);

        let markerControls = new THREEx.ArMarkerControls(arToolkitContext, markerRoot, {
            type: 'pattern',
            patternUrl: "data/" + patternArray[i] + ".patt",
        });

        var baseMap = getBaseMap();

        baseMap.rotation.set(-Math.PI / 2, 0, 0)

        markerRoot.add(baseMap);

        //var flows = getFlows(cityChosen[parseInt(i / 2)], representationChosen[parseInt(i % 2)]);

        //console.log(eval(confString)[i])

        var flows = getFlows(eval(confString)[i]);

        flows.rotation.set(-Math.PI / 2, 0, 0);

        markerRoot.add(flows);

    }

}


function update() {
    // update artoolkit on every frame
    if (arToolkitSource.ready !== false)
        arToolkitContext.update(arToolkitSource.domElement);
}


function render() {
    renderer.render(scene, camera);
}


function animate() {
    requestAnimationFrame(animate);
    deltaTime = clock.getDelta();
    totalTime += deltaTime;
    update();
    render();
}