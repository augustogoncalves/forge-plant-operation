/////////////////////////////////////////////////////////////////////
// Copyright (c) Autodesk, Inc. All rights reserved
// Written by Forge Partner Development
//
// Permission to use, copy, modify, and distribute this software in
// object code form for any purpose and without fee is hereby granted,
// provided that the above copyright notice appears in all copies and
// that both that copyright notice and the limited warranty and
// restricted rights notice below appear in all supporting
// documentation.
//
// AUTODESK PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS.
// AUTODESK SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE.  AUTODESK, INC.
// DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
// UNINTERRUPTED OR ERROR FREE.
/////////////////////////////////////////////////////////////////////

class ProcessFlowExtension extends Autodesk.Viewing.Extension {
    constructor(viewer, options) {
        super(viewer, options);
        this._group = null;
        this._button = null;
        this._process = {};

        this._process['Main Process'] = [7260, 7269, 7263, 4853, 4847, 4841, 4835, 4829, 4823, 4811, 4761, 4755, 4749, 4743, 4737, 4677, 4671, 4695, 4692, 4665, 4659, 4653, 4647, 4623, 4620, 4607, 4601, 4595, 4589, 4583, 4570, 4577, 218]
    }

    load() {
        return true;
    }

    unload() {
        // Clean our UI elements if we added any
        if (this._group) {
            this._group.removeControl(this._button);
            if (this._group.getNumberOfControls() === 0) {
                this.viewer.toolbar.removeControl(this._group);
            }
        }

        return true;
    }

    onToolbarCreated() {
        // Create a new toolbar group if it doesn't exist
        this._group = this.viewer.toolbar.getControl('customExtensions');
        if (!this._group) {
            this._group = new Autodesk.Viewing.UI.ControlGroup('customExtensions');
            this.viewer.toolbar.addControl(this._group);
        }

        // Add a new button to the toolbar group
        this._button = new Autodesk.Viewing.UI.Button('ProcessFlowExtension');
        this._button.onClick = (ev) => {
            this._enabled = !this._enabled;
            this._button.setState(this._enabled ? 0 : 1);

            if (!this._enabled) {
                this.viewer.isolate();
                //this.viewer.clearThemingColor();
                //this.viewer.utilities.goHome();
                return;
            }

            // custom action
            //var _this = this;
            //this.viewer.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, function (e) { _this._ids.push(e.dbIdArray[0]); console.log(_this._ids) })

            const state = JSON.parse('{"seedURN":"dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6YnBfdGVzdF9idWNrZXRfZy8xLVBFLTAwMS5kd2c=","objectSet":[{"id":[],"idType":"lmv","isolated":[],"hidden":[],"explodeScale":0}],"viewport":{"name":"","eye":[-730.614165306221,-193.48092697715057,-433.55478843064947],"target":[-249.49839618724786,342.457187997302,-879.4462564343636],"up":[0.3516433349520968,0.39171251115436545,0.8502401270164262],"worldUpVector":[0,0,1],"pivotPoint":[305.5879428497374,156.6839270141727,-503.7991951009071],"distanceToOrbit":847.066259283076,"aspectRatio":1.9129213483146068,"projection":"orthographic","isOrthographic":true,"orthographicHeight":847.0662592830728},"renderOptions":{"environment":"Sharp Highlights","ambientOcclusion":{"enabled":true,"radius":10,"intensity":1},"toneMap":{"method":1,"exposure":-9,"lightMultiplier":-1e-20},"appearance":{"ghostHidden":true,"ambientShadow":true,"antiAliasing":true,"progressiveDisplay":true,"swapBlackAndWhite":false,"displayLines":true,"displayPoints":true}},"cutplanes":[]}');

            let t = 3;
            this.viewer.restoreState(state);
            this.viewer.isolate(1);
            let currentIds = [];
            this._process['Main Process'].forEach((dbId) => {
                setTimeout(() => {
                    isSelecting = true;
                    this.viewer.show(dbId);
                    currentIds.push(dbId);
                    this.viewer.select(dbId);
                    //this.viewer.setThemingColor(dbId, new THREE.Vector4(0, 0, 0, 1));
                    this.viewer.utilities.fitToView();
                    this.viewer.select(0);
                    isSelecting = false;
                }, t * 1000);
                t++;
            });

            setTimeout(() => {
                isSelecting = true;
                this.viewer.select(currentIds);
                this.viewer.utilities.fitToView();
                this.viewer.select(0);
                isSelecting = false;
            }, (this._process['Main Process'].length + 5) * 1000);
        };
        this._button.setToolTip('Show process flow');
        this._button.container.children[0].classList.add('fas', 'fa-play-circle');
        this._group.addControl(this._button);
    }
}

Autodesk.Viewing.theExtensionManager.registerExtension('ProcessFlowExtension', ProcessFlowExtension);