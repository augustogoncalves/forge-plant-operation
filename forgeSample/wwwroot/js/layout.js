var pstyle = 'border: 1px solid #dfdfdf;';
var config = {
    layout: {
        name: 'layout',
        panels: [
            { type: 'top', size: 50, resizable: false, style: pstyle + 'padding: 8px' },
            { type: 'left', size: 45, resizable: false, style: pstyle },
            { type: 'main', size: '50%', style: pstyle + 'border-top: 0px;' },
            {
                type: 'right', size: '50%', resizable: true, style: pstyle,
                toolbar: {
                    items: [
                        { type: 'spacer' },
                        { type: 'check', id: 'runTempCheck', text: 'Temperature', icon: 'fas fa-thermometer-half', tooltip: 'Run temperature check' }
                    ],
                    onClick: function (event) {
                        switch (event.item.id) {
                            case 'runTempCheck':
                                runTempCheck(!event.item.checked);
                                break;
                        }

                    }
                }
            },
            //{ type: 'bottom', size: '200px', resizable: true, style: pstyle }
        ],
        onResize: function (event) {
            setTimeout(function () {
                if (viewers['2d'] !== undefined) viewers['2d'].resize();
                if (viewers['3d'] !== undefined) viewers['3d'].resize();
            }, 500);
        }
    },
    sidebar: {
        name: 'sidebar',
        flatButton: true,
        flat: true,
        expanded: false,
        group: true,
        groupShowHide: false,
        nodes: [],
        onFlat: function (event) {
            $('#sidebar').css('width', (event.goFlat ? '35px' : '200px'));
            w2ui['layout'].set('left', { size: (event.goFlat ? '45px' : '200px') });
        },
        onExpand: function (event) {
            expandSidebar(event);
        },
        onClick: function (event) {
            if (event.node.icon !== null) {
                switch (event.node.icon) {
                    case 'fas fa-file-pdf':
                        w2popup.open({ body: '<object data="' + event.node.id + '" type="application/pdf" width="480px" height="500px"><embed src="' + event.node.id + '" type="application/pdf" width="480px" height="500px"/></object>', showMax: true, width: 500, height: 500 }) // <iframe src="' + event.node.id + '" width="480px"></iframe>'
                        break;
                    case 'fas fa-images':
                        w2popup.open({ body: '<img src="' + event.node.id + '" width="480px"/>', showMax: true, width: 500, height: 500 })
                        break;
                    default:
                        window.open(event.node.id);
                }
                return;
            }
            var dbIds = $.map(event.node.id.split('-'), function (value) {
                return parseInt(value, 10);
            });
            select(dbIds, event.node.text);
        }
    }
}

$(document).ready(function () {
    $('#layout').w2layout(config.layout);
    w2ui.layout.html('top', '<a href="http://developer.autodesk.com" target="_blank"><img alt="Autodesk Forge" src="//developer.static.autodesk.com/images/logo_forge-2-line.png" height="30"></a>');
    w2ui.layout.html('left', $().w2sidebar(config.sidebar));
    w2ui.layout.load('main', '/panels/viewer2d.html');
    w2ui.layout.load('right', '/panels/viewer3d.html');
})