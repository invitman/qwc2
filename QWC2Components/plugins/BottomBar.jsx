/**
 * Copyright 2016, Sourcepole AG.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {connect} = require('react-redux');
const proj4js = require('proj4');
const Message = require('../../MapStore2/web/client/components/I18N/Message');
const ConfigUtils = require("../../MapStore2/web/client/utils/ConfigUtils");
const CRSSelector = require("../../MapStore2/web/client/components/mapcontrols/mouseposition/CRSSelector");
const ScaleBox = require("../../MapStore2/web/client/components/mapcontrols/scale/ScaleBox");
const CoordinatesUtils = require('../../MapStore2/web/client/utils/CoordinatesUtils');
const {getScales} = require('../../MapStore2/web/client/utils/MapUtils');
const {changeMousePositionState, changeMousePositionCrs} = require('../../MapStore2/web/client/actions/mousePosition');
const {changeZoomLevel} = require('../../MapStore2/web/client/actions/map');
require('./style/BottomBar.css');

const BottomBar = React.createClass({
    propTypes: {
        mousepos: React.PropTypes.object,
        displaycrs:  React.PropTypes.string,
        onCRSChange: React.PropTypes.func,
        mapcrs:  React.PropTypes.string,
        mapscale: React.PropTypes.number,
        fullscreen: React.PropTypes.bool,
        onScaleChange: React.PropTypes.func
    },
    getDefaultProps() {
        return {
            mousepos: {x: 0, y: 0, crs: "EPSG:4326"},
            displaycrs: "EPSG:4326",
            mapscale: 0
        }
    },
    getInitialState: function() {
        return {mapscales: undefined};
    },
    componentWillReceiveProps(nextProps) {
        if ((this.props.mapcrs != nextProps.mapcrs) || (this.state.mapscales === undefined && nextProps.mapcrs !== undefined)) {
            this.setState({mapscales: getScales(nextProps.mapcrs)});
        }
    },
    render() {
        if(this.props.fullscreen) {
            return null;
        }
        let {x, y} = CoordinatesUtils.reproject([this.props.mousepos.x, this.props.mousepos.y], this.props.mousepos.crs, this.props.displaycrs);
        let digits = proj4js.defs(this.props.displaycrs).units === 'degrees'? 4 : 0;
        return (
            <div id="BottomBar">
                <span className="mousepos_label"><Message msgId="bottombar.mousepos_label" />: </span>
                <input type="text" className="mouseposition" value={x.toFixed(digits) + " " + y.toFixed(digits)} readOnly="readOnly"/>
                <CRSSelector useRawInput={true} enabled={true} crs={this.props.displaycrs} id="crssselector" onCRSChange={this.props.onCRSChange}/>
                <span className="scale_label"><Message msgId="bottombar.scale_label" />: </span>
                <ScaleBox useRawInput={true} id="scaleselector" scales={this.state.mapscales} currentZoomLvl={this.props.mapscale} onChange={this.props.onScaleChange} />
                <span className="bottomlinks">
                    <a href={ConfigUtils.getConfigProp("viewertitle_link")}>
                        <Message className="viewertitle_label" msgId="bottombar.viewertitle_label" />
                    </a> | <a href={ConfigUtils.getConfigProp("terms_link")}>
                        <Message className="terms_label" msgId="bottombar.terms_label" />
                    </a>
                </span>
            </div>
        );
    },
    componentWillMount() {
        changeMousePositionState(true);
    }
});

const selector = (state) => ({
    mousepos: {
        x: state && state.mousePosition && state.mousePosition.position ? state.mousePosition.position.x : 0,
        y: state && state.mousePosition && state.mousePosition.position ? state.mousePosition.position.y : 0,
        crs: state && state.mousePosition && state.mousePosition.position ? state.mousePosition.position.crs : "EPSG:4326"
    },
    displaycrs: state && state.mousePosition && state.mousePosition ? state.mousePosition.crs : "EPSG:4326",
    mapcrs: state && state.map && state.map.present ? state.map.present.projection : undefined,
    mapscale: state && state.map && state.map.present ? state.map.present.zoom : 0,
    fullscreen: state.display && state.display.fullscreen
});

module.exports = {
    BottomBarPlugin: connect(selector, {
        onCRSChange: changeMousePositionCrs,
        onScaleChange: changeZoomLevel
    })(BottomBar),
    reducers: {
        mousePosition: require('../../MapStore2/web/client/reducers/mousePosition')
    }
};