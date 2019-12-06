var classes = {}; // map of classes and elements (3D)
var dbIds3d; // all leaf nodes on 3D
var dbIds3dPnP = []; // leaf nodes with PnPClassName

function objectTreeLoaded(v, e) {
    switch (v) {
        case '3d':
            getAllLeafComponents(e.model, function (dbIds) {
                dbIds3d = dbIds;
                e.model.getBulkProperties(dbIds, ['PnPClassName', 'LineNumberTag', 'Tag'], (elements) => {
                    elements.forEach((ele) => {
                        if (ele.properties.length < 2) return;
                        dbIds3dPnP.push(ele.dbId);
                        var pnpClass = getPropertyByName(ele.properties, 'PnPClassName');
                        var tag = getPropertyByName(ele.properties, ['LineNumberTag', 'Tag'])
                        if (classes[pnpClass] === undefined) classes[pnpClass] = [];
                        if (classes[pnpClass][tag] === undefined) classes[pnpClass][tag] = [];
                        classes[pnpClass][tag].push(ele.dbId);
                    })

                    showPnPClasses();
                    showPnPTable();
                })
            })
    }
}

function runTempCheck(run) {
    viewers['3d'].clearThemingColors();
    if (!run) return;
    if (dbIds3d === undefined || dbIds3d.length === 0) return;

    // make everything gray...
    var gray = new THREE.Vector4(192 / 255, 192 / 255, 192 / 255, 1);
    dbIds3d.forEach((dbId) => {
        viewers['3d'].setThemingColor(dbId, gray);
    });

    // random color code (from blue to red)
    dbIds3dPnP.forEach((dbId) => {
        setTimeout(() => {
            viewers['3d'].setThemingColor(dbId, rangeColor(Math.random()));
        }, 5000 * Math.random());
    })
}

function showPnPTable() {
    //viewers['3d'].model.getBulkProperties(dbIds3dPnP, ['PnPId', 'PnPClassName', 'LineNumberTag', 'Tag'], (elements) => {
    //});
}

function rangeColor(factor) {
    var color1 = [30, 144, 255];
    var color2 = [240, 128, 128];
    var result = color1.slice();
    for (var i = 0; i < 3; i++) {
        result[i] = Math.round(result[i] + factor * (color2[i] - color1[i]));
    }
    return new THREE.Vector4(result[0] / 255, result[1] / 255, result[2] / 255, 1);;
}

function getPropertyByName(props, names) {
    if (!Array.isArray(names)) names = [names];
    for (var i = 0; i < props.length; i++)
        if (names.indexOf(props[i].displayName) >= 0)
            return props[i].displayValue;
}

function select(dbIds, tag) {
    viewers['3d'].select(dbIds);
    viewers['3d'].utilities.fitToView();

    isSelecting = true;
    searchAndSelectElements('2d', [{ props: ['Tag'], value: tag }]);
}

function showPnPClasses() {
    var items = [];
    Object.keys(classes).forEach((c) => {
        var tags = [];
        Object.keys(classes[c]).forEach((t) => {
            if (t === '?') return;
            tags.push({ id: classes[c][t].join('-'), text: '' + t });
            addAttachments(classes[c][t].join('-'), t);
        })
        items.push({ id: c, text: c, group: true, expanded: false, nodes: tags });
    });
    w2ui.sidebar.add(items);
}

function addAttachments(sideBarId, tag) {
    jQuery.ajax({
        url: '/api/attachments/' + tag,
        success: function (res) {
            if (res === "") return;
            var nodes = [];
            if (res.docs !== null) {
                res.docs.forEach((doc) => {
                    var icon = '';
                    switch (doc.split('.').reverse()[0]) {
                        case 'pdf': icon = 'fas fa-file-pdf'; break;
                        default: icon = 'fas fa-file'; break;
                    }
                    nodes.push({ id: doc, text: doc.split('/').reverse()[0], icon: icon })
                })
            }
            if (res.images !== null) {
                res.images.forEach((img) => {
                    nodes.push({ id: img, text: img.split('/').reverse()[0], icon: 'fas fa-images' })
                })
            }

            w2ui.sidebar.insert(sideBarId, null, nodes);
        }
    });


}

function expandSidebar(e) {

}


var isSelecting = false;
function selectionChanged(v, e) {
    if (isSelecting) return
    if (e.dbIdArray.length === 0) return;
    switch (v) {
        case '2d':
            viewers[v].model.getBulkProperties(e.dbIdArray, ['Tag', 'Description'], (elements) => {
                var tags = [];
                elements.forEach((ele) => {
                    if (ele.properties.length != 2) return;

                    var tag = ele.properties[1].displayValue;
                    var desc = ele.properties[0].displayValue;
                    var tagSplit = ele.properties[1].displayValue.split('-').reverse();

                    switch (desc) {
                        case 'PRIMARY LINE SEGMENT':
                            tags.push({ props: ['LineNumberTag'], value: tagSplit[0].replace('?', '') });
                            break;
                        default:
                            tags.push({ props: ['Tag'], value: (tagSplit[1] + '-' + tagSplit[0]).replace('?', '') });
                            break;
                    }
                })
                searchAndSelectElements('3d', tags);
            });

            break;
    }
}

function searchAndSelectElements(v, tags) {
    var idsToSelect = []
    var searchCount = 0;
    tags.forEach((tag) => {
        searchCount++;
        viewers[v].search(tag.value, (dbIds) => {
            idsToSelect = idsToSelect.concat(dbIds)
            viewers[v].select(idsToSelect);
            viewers[v].utilities.fitToView();
            searchCount--;
            if (searchCount === 0) isSelecting = false;
        }, null, tag.props)
    })
}

function getAllLeafComponents(model, callback) {
    var cbCount = 0; // count pending callbacks
    var components = []; // store the results
    var tree; // the instance tree

    function getLeafComponentsRec(parent) {
        cbCount++;
        if (tree.getChildCount(parent) != 0) {
            tree.enumNodeChildren(parent, function (children) {
                getLeafComponentsRec(children);
            }, false);
        } else {
            components.push(parent);
        }
        if (--cbCount == 0) callback(components);
    }
    model.getObjectTree(function (objectTree) {
        tree = objectTree;
        var allLeafComponents = getLeafComponentsRec(tree.getRootId());
    });
}