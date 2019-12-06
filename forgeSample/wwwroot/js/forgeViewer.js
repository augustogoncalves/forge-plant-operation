var viewers = [];

$(document).ready(function () {
    // initialize and load the 2 models
    var options = {
        env: 'AutodeskProduction',
        getAccessToken: getForgeToken,
    };
    Autodesk.Viewing.Initializer(options, () => {
        viewers['2d'] = launchViewer('forgeViewer2d', 'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6YnBfdGVzdF9idWNrZXRfZi8xLUExLTEwMDEtdjJiLmR3Zng=');
        viewers['3d'] = launchViewer('forgeViewer3d', 'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6YnBfdGVzdF9idWNrZXRfZy8xLVBFLTAwMS5kd2c=', '3bb36b05-6fb7-1fd0-3c58-d83a4e8d4042');

        viewers['2d'].addEventListener(Autodesk.Viewing.OBJECT_TREE_CREATED_EVENT, function(e){objectTreeLoaded('2d', e)});
        viewers['3d'].addEventListener(Autodesk.Viewing.OBJECT_TREE_CREATED_EVENT, function(e){objectTreeLoaded('3d', e)});

        viewers['2d'].addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, function(e){selectionChanged('2d', e)});
        viewers['3d'].addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, function(e){selectionChanged('3d', e)});

        viewers['3d'].autocam.shotParams.destinationPercent = 3;
        viewers['3d'].autocam.shotParams.duration = 3;

        viewers['2d'].autocam.shotParams.destinationPercent = 3;
        viewers['2d'].autocam.shotParams.duration = 3;
    });
});

// @urn the model to show
// @viewablesId which viewables to show, applies to BIM 360 Plans folder
function launchViewer(div, urn, viewableId) {
    var viewer;
    viewer = new Autodesk.Viewing.GuiViewer3D(document.getElementById(div));
    viewer.start();
    var documentId = 'urn:' + urn;
    Autodesk.Viewing.Document.load(documentId, onDocumentLoadSuccess, onDocumentLoadFailure);

    function onDocumentLoadSuccess(doc) {
        // if a viewableId was specified, load that view, otherwise the default view
        var viewables = (viewableId ? doc.getRoot().findByGuid(viewableId) : doc.getRoot().getDefaultGeometry());
        viewer.loadDocumentNode(doc, viewables).then(i => {
            // any additional action here?
        });
    }

    function onDocumentLoadFailure(viewerErrorCode) {
        console.error('onDocumentLoadFailure() - errorCode:' + viewerErrorCode);
    }

    return viewer;
}

function getForgeToken(callback) {
    fetch('/api/forge/oauth/token').then(res => {
        res.json().then(data => {
            callback(data.access_token, data.expires_in);
        });
    });
}