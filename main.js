$('.dropdown-toggle').on('click touchstart', function(){
  $('.dropdown-menu').toggleClass('dropdown-menu-open');

  if ($('.dropdown-menu').hasClass('dropdown-menu-open')) {
    $(".btn.btn-primary.dropdown-toggle").html("&#x25B2");
  } else {
    $(".btn.btn-primary.dropdown-toggle").html("Color &#x25BC");
  }
});

$('.panel_expand').on('click touchstart', function(){
  var v1 = document.getElementById("view_1");
  if (v1.style.display === "none") {
    v1.style.display = "block";
  } else {
    v1.style.display = "none";
  }
  var v2 = document.getElementById("view_2");
  if (v2.style.display === "none") {
    v2.style.display = "block";
  } else {
    v2.style.display = "none";
  }
});

//$('#panel_expand').on('click touchstart', function(){
//  document.getElementById("view_1").style.display = "none";
//  document.getElementById("view_2").style.display = "block";
//});

$('#bay_image_link').on('click touchstart', function(){
  document.getElementById("view_1").style.display = "none";
  document.getElementById("view_2").style.display = "block";
  document.body.style.backgroundColor = "var(--owhite)";
});

function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

let memoize = function (factory, ctx) {
    const cache = {};
    return function (key) {
        if (!(key in cache)) {
            cache[key] = factory.call(ctx, key);
        }
        return cache[key];
    };
};

let colorToRGBA = (function () {
    let canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    let ctx = canvas.getContext('2d');

    return memoize(function (col) {
        ctx.clearRect(0, 0, 1, 1);
        // In order to detect invalid values,
        // we can't rely on col being in the same format as what fillStyle is computed as,
        // but we can ask it to implicitly compute a normalized value twice and compare.
        ctx.fillStyle = '#000';
        ctx.fillStyle = col;
        const computed = ctx.fillStyle;
        ctx.fillStyle = '#fff';
        ctx.fillStyle = col;
        if (computed !== ctx.fillStyle) {
            return; // invalid color
        }
        ctx.fillRect(0, 0, 1, 1);
        let d = ctx.getImageData(0, 0, 1, 1).data
        return {red: d[0], green: d[1], blue: d[2], alpha: d[3]};
    });
})();

function colorGradient(fadeFraction, rgbColor1, rgbColor2, rgbColor3) {
    let color1 = colorToRGBA(rgbColor1);
    let color2 = colorToRGBA(rgbColor2);
    let fade = fadeFraction;

    // Do we have 3 colors for the gradient? Need to adjust the params.
    if (rgbColor3) {
        fade = fade * 2;

        // Find which interval to use and adjust the fade percentage
        if (fade >= 1) {
            fade -= 1;
            color1 = color2;
            color2 = colorToRGBA(rgbColor3);
        }
    }

    let diffRed = color2.red - color1.red;
    let diffGreen = color2.green - color1.green;
    let diffBlue = color2.blue - color1.blue;
    let diffAlpha = color2.alpha - color1.alpha;

    let gradient = {
        red: Math.floor(color1.red + (diffRed * fade)).toFixed(0),
        green: Math.floor(color1.green + (diffGreen * fade)).toFixed(0),
        blue: Math.floor(color1.blue + (diffBlue * fade)).toFixed(0),
        alpha: Math.floor(color1.alpha + (diffAlpha * fade)) / 256,
    };

    return 'rgb(' + gradient.red + ',' + gradient.green + ',' + gradient.blue + ',' + gradient.alpha + ')';
}

let colorsContainer = document.getElementById("colors")
let gradientColors = [
    'rgba(255,0,0,0.5)',
    'rgb(255,132,0,0.5)',
    'rgb(255,213,0,0.5)',
    'rgb(0,255,0,0.5)',
    'rgba(0,0,255,0.5)',
    'rgb(200,0,255,0.5)'
]
let colors = []

let q = parseQuery(location.search)

gradientColors.forEach((c, i) => {
    let cid = `color_${i}`
    let l = document.createElement("label")
    l.for = cid
    l.className = 'color_sample'
    l.style.backgroundColor = c
    l.innerHTML = "&nbsp;"
    let inp = document.createElement("input")
    inp.id = cid
    inp.type = "number"
    inp.min = "0"
    inp.max = "1000"
    if (q[cid]) {
        inp.value = q[cid]
    } else {
        inp.value = `${i * 20}`
    }
    let sp = document.createElement("span")
    sp.innerHTML = "<span>/m<sup>2</sup></span>"
    let d = document.createElement("div")
    d.className = 'color_container'
    d.appendChild(l)
    d.appendChild(inp)
    d.appendChild(sp)
    colorsContainer.appendChild(d)
    colors.push([c, inp])
})

function countColor(count) {
    let clrs = colors.map(c => [c[0], parseFloat(c[1].value)])
    for (let i in clrs) {
        if (count < clrs[i][1]) {
            if (i === "0") {
                return clrs[0][0]
            } else {
                let min = clrs[i - 1]
                let max = clrs[i]
                return colorGradient((count - min[1]) / (max[1] - min[1]), min[0], max[0])
            }
        }
    }

    return clrs[clrs.length - 1][0]
}

const createTextStyle = function (text, resolution, placement = 'point') {
    let align = 'center';
    let baseline = 'middle';
    let size = '10px';
    let height = '1';
    let offsetX = 0;
    let offsetY = 0;
    let weight = 'bold';
    // let placement = 'point';
    let maxAngle = 0.7853981633974483;
    let overflow = true;
    let rotation = 0.0;
    let font = weight + ' ' + size + '/' + height + ' ' + 'Verdana';
    let fillColor = 'black';
    // let outlineColor = 'black';
    // let outlineWidth = 0;

    return new ol.style.Text({
        textAlign: align === '' ? undefined : align,
        textBaseline: baseline,
        font: font,
        text: text,
        fill: new ol.style.Fill({color: fillColor}),
        // stroke: new ol.style.Stroke({color: outlineColor, width: outlineWidth}),
        offsetX: offsetX,
        offsetY: offsetY,
        placement: placement,
        maxAngle: maxAngle,
        overflow: overflow,
        rotation: rotation,
        scale: [1 / resolution, 1 / resolution]
    });
};

let styles = {
    'detection': {
        'flower': new ol.style.Style({
            image: new ol.style.Circle({
                radius: 2,
                fill: new ol.style.Fill({
                    color: 'rgba(140, 208, 95, 1.0)',
                }),
                stroke: null,
            }),
        }),
    }
};


function parseQuery(queryString) {
    let query = {};
    let pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
    for (let i = 0; i < pairs.length; i++) {
        let pair = pairs[i].split('=');
        query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
    }
    return query;
}

function makeQuery(query) {
    let search = []
    Object.keys(query).map(function (key, _index) {
        search.push(encodeURIComponent(key) + "=" + encodeURIComponent(query[key]))
    });
    return "?" + search.join("&")
}


let vectorSource = new ol.source.Vector({
    format: new ol.format.OSMXML(),
    attributions: 'Orchard Data: <a href="https://acurissystems.com">&copy; Acuris Systems</a>',
    url: (q['orchard'] || 'orchard') + '.xml',
    strategy: ol.loadingstrategy.all,
})

if (q['count']) {
    document.getElementById('count-class').value = q['count']
}

let counters = {}

let autofit = true

vectorSource.on('addfeature', function (event) {
    let feature = event.feature
    if (feature.get('acuris') === 'orchard') {
        window.document.title = feature.get('name').replace(/^\w/, c => c.toUpperCase()) + ' Scan'
        if (autofit) {
            map.getView().fit(ol.extent.buffer(vectorSource.getExtent(), 50));
        }
    }
    let area = feature.get('area')
    if (area === undefined) {
        area = ol.sphere.getArea(feature.getGeometry())
        feature.set('area', area.toString(), true);
    }

    for (const feature_count of feature.getKeys().filter(k => k.startsWith("count:"))) {
        let cnt_name = feature_count.substring(6)
        if (!counters.hasOwnProperty(cnt_name)) {
            let cnt_parts = cnt_name.split(':')
            let cnt_class = cnt_parts[0]
            let cnt_scan = cnt_parts[1]
            counters[cnt_name] = cnt_class.replace(/^\w/, c => c.toUpperCase()) + " (" + cnt_scan + ")"
            let count_class = document.getElementById('count-class')
            while (count_class.options.length) {
                count_class.options.remove(0);
            }
            for (let cntr in counters) {
                if (counters.hasOwnProperty(cntr)) {
                    let opt = new Option(counters[cntr], cntr);
                    count_class.options.add(opt);
                }
            }
            if (q['count']) {
                count_class.value = q['count']
            }
        }
    }
});


function countQuality(count, min = 10, max = 60) {
    if (count < min) {
        return 0.0
    } else if (count > max) {
        return 1.0
    } else {
        return (count - min) / (max - min)
    }
}


function objectStyle(feature, resolution) {

    for (let key in styles) {
        let value = feature.get(key)
        if (value !== undefined) {
            for (let regexp in styles[key]) {
                if (new RegExp(regexp).test(value)) {
                    return styles[key][regexp]
                }
            }
        }
    }

    let acuris_feature = feature.get('acuris')
    if (acuris_feature !== undefined) {
        if (acuris_feature === 'bay') {

            let counter = 'count:' + document.getElementById('count-class').value
            let count = parseInt(feature.get(feature.getKeys().filter(k => k === counter)[0]))

            let area = parseFloat(feature.get('area'))
            let selected = select.getFeatures().item(0) === feature
            return new ol.style.Style({
                zIndex: selected ? 200 : 100,
                fill: new ol.style.Fill({
                    // color: count ? colorGradient(countQuality(count / area), 'rgba(255,0,0,0.5)', 'rgba(0,255,0,0.5)', 'rgba(0,0,255,0.5)') : 'rgba(127,127,127,0.5)',
                    color: count ? countColor(count / area) : 'rgba(127,127,127,0.5)'
                }),
                stroke: selected ? new ol.style.Stroke({color: 'rgba(255,0,0,1)'}) : undefined
                // text: bay === 1 && resolution < 0.5 ? createTextStyle("" + row, resolution * 3) : undefined,
            })
        } else if (acuris_feature === 'block') {
            return new ol.style.Style({
                zIndex: 102,
                stroke: new ol.style.Stroke({
                    color: 'rgba(255, 255 , 255, 1)',
                }),
                fill: new ol.style.Fill({
                    color: 'rgba(255, 255 , 255, 0.01)',
                }),
                text: resolution < 1.6 ? createTextStyle(feature.get('name'), resolution) : undefined,
            })
        } else if (acuris_feature === 'row') {
            return new ol.style.Style({
                zIndex: 101,
                stroke: resolution < 0.5 ? new ol.style.Stroke({
                    color: 'rgba(255, 255 , 255, 1)',
                }) : undefined,
                fill: new ol.style.Fill({
                    color: 'rgba(255, 255 , 255, 0.01)',
                })
            })
        } else if (acuris_feature === 'row-center') {
            return new ol.style.Style({
                zIndex: 103,
                text: resolution < 0.5 ? createTextStyle(feature.get('name'), resolution * 3, 'point') : undefined,
            })
        } else if (acuris_feature === 'orchard') {
            return new ol.style.Style({
                zIndex: 104,
                fill: new ol.style.Fill({
                    color: 'rgba(1,1,1,0.01)',
                }),
                stroke: new ol.style.Stroke({
                    color: 'rgba(255, 255, 255, 1)',
                    width: 4
                }),
                text: resolution >= 1.6 ? createTextStyle(feature.get('name'), resolution / 3) : undefined,
            })
        }
    }
    return null;

}

let vectorLayer = new ol.layer.Vector({
    source: vectorSource,
    style: objectStyle,
})

let ZoomToExtentControl = /*@__PURE__*/(function (Control) {
    function ZoomToExtentControl(opt_options) {
        let options = opt_options || {};

        let button = document.createElement('button');
        button.innerHTML = '<span class="icon-view"></span>';

        let element = document.createElement('div');
        element.className = 'ol-zoom-extent ol-unselectable ol-control';
        element.appendChild(button);

        ol.control.Control.call(this, {
            element: element,
            target: options.target,
        });

        button.addEventListener('click', this.handleZoomToExtent.bind(this), false);
    }

    if (Control) ZoomToExtentControl.__proto__ = ol.control.Control;
    ZoomToExtentControl.prototype = Object.create(ol.control.Control && ol.control.Control.prototype);
    ZoomToExtentControl.prototype.constructor = ZoomToExtentControl;

    ZoomToExtentControl.prototype.handleZoomToExtent = function handleRotateNorth() {
        map.getView().fit(ol.extent.buffer(vectorSource.getExtent(), 50));
    };

    return ZoomToExtentControl;
}(ol.control.Control));

let RefreshControl = /*@__PURE__*/(function (Control) {
    function RefreshControl(opt_options) {
        let options = opt_options || {};

        let button = document.createElement('button');
        button.innerHTML = '&#70101;'

        let element = document.createElement('div');
        element.className = 'ol-refresh ol-unselectable ol-control';
        element.appendChild(button);

        ol.control.Control.call(this, {
            element: element,
            target: options.target,
        });

        button.addEventListener('click', this.handleRefresh.bind(this), false);
    }

    if (Control) RefreshControl.__proto__ = ol.control.Control;
    RefreshControl.prototype = Object.create(ol.control.Control && ol.control.Control.prototype);
    RefreshControl.prototype.constructor = RefreshControl;

    RefreshControl.prototype.handleRefresh = function handleRotateNorth() {
        autofit = false
        vectorSource.refresh()
    };

    return RefreshControl;
}(ol.control.Control));

let map = new ol.Map({
    target: 'map',
    layers: [
        new ol.layer.Tile({
            source: new ol.source.XYZ({
                attributions:
                    'Basemap: <a href="https://basemaps.linz.govt.nz">&copy; CC BY 4.0 LINZ</a>',
                url:
                    'https://basemaps.linz.govt.nz/v1/tiles/aerial/EPSG:3857/{z}/{x}/{y}.png?api=c01f20fbsrmbsnt86s2h9knss58',
            })
        }),
        vectorLayer
    ],
    view: new ol.View({
        center: [19123431.851703886, -4977705.277696917], //ol.proj.fromLonLat([175.57938796, -36.77322518]),
        zoom: 6,
        maxZoom: 22
    }),
    controls: ol.control.defaults().extend([
        new ol.control.ScaleLine(),
        new ZoomToExtentControl(),
        new RefreshControl()
    ]),
});

map.on('pointermove', showInfo);
let select = new ol.interaction.Select({
    filter: function (f) {
        return f.get('acuris') === 'bay'
    },
    style: objectStyle,
    toggleCondition: ol.events.condition.never
})
map.addInteraction(select)

// takes array of file details features and outputs clear dict dets of useful details
function details(features) {
    let dets = {};
    dets['Orchard'] = features.filter(f => f.get('acuris') === 'orchard').map(f => f.get('name')).filter(n => n !== undefined)[0]
    dets['Block'] = features.filter(f => f.get('acuris') === 'block').map(f => f.get('name')).filter(n => n !== undefined)[0]
    dets['Row'] = features.filter(f => f.get('acuris') === 'row').map(f => f.get('name')).filter(n => n !== undefined)[0]
    dets['Bay'] = features.filter(f => f.get('acuris') === 'bay').map(f => f.get('name')).filter(n => n !== undefined)[0]

    let allAcuris = Object.assign({}, ...features.filter(f => f.get('acuris') !== undefined).map((x) => ({[x.get('acuris')]: x})))

    if (Object.keys(allAcuris).length > 0) {
        const priority = ['bay', 'row', 'block', 'orchard']
        let topmostAcuris = allAcuris[priority.filter(t => allAcuris.hasOwnProperty(t))[0]]
        let area = parseFloat(topmostAcuris.get('area'))
        dets['Location'] = ol.coordinate.toStringXY(ol.proj.toLonLat(ol.extent.getCenter(topmostAcuris.getGeometry().getExtent())), 8)
        for (const feature_count of topmostAcuris.getKeys().filter(k => k.startsWith("count:"))) {
            let cnt = topmostAcuris.get(feature_count)
            let cnt_name = feature_count.substring(6)
            let cnt_parts = cnt_name.split(':')
            let cnt_class = cnt_parts[0]
            let cnt_scan = cnt_parts[1]
            dets[cnt_class.replace(/^\w/, c => c.toUpperCase()) + " (" + cnt_scan + ") Count"] = area ? `${cnt} (${(cnt / area).toFixed(1)}/m<sup>2</sup>)` : `${cnt}`
        }
        if (area < 10000) {
            dets['Area'] = `${area.toFixed(1)} m<sup>2</sup>`;
        } else {
            dets['Area'] = `${(area / 10000).toFixed(1)} ha`;
        }
    }
    return dets
}

select.on('select', function (e) {
        let selected = e.target.getFeatures().item(0)
        // if valid item selected:
        if (selected !== undefined) {
            let hierarchy = vectorSource.getFeaturesAtCoordinate(ol.extent.getCenter(selected.getGeometry().getExtent()))

            let orchard = hierarchy.filter(f => f.get('acuris') === 'orchard').map(f => f.get('name')).filter(n => n !== undefined)[0];
            let block = hierarchy.filter(f => f.get('acuris') === 'block').map(f => f.get('name')).filter(n => n !== undefined)[0];
            let row = hierarchy.filter(f => f.get('acuris') === 'row').map(f => f.get('name')).filter(n => n !== undefined)[0];
            let bay = hierarchy.filter(f => f.get('acuris') === 'bay').map(f => f.get('name')).filter(n => n !== undefined)[0];
            let scans = new Set()
            for (const feature_count of selected.getKeys().filter(k => k.startsWith("count:"))) {
                let cnt_name = feature_count.substring(6)
                let cnt_parts = cnt_name.split(':')
                scans.add(cnt_parts[1])
            }
            let scan = scans.values().next().value
            let orchard_id = orchard.replace(/ /g, "-").toLowerCase()
            let block_id = block.replace(/ /g, "-").toLowerCase()
            console.log('selected: ', orchard_id, scan, block_id, row, bay)
            let bay_image = document.getElementById('bay_image')
            bay_image.src = `scans/${orchard_id}/${scan}/${block_id}/${pad(row, 2)}/${pad(bay, 2)}.jpg`
            let bay_image_2 = document.getElementById('bay_image_2')
            bay_image_2.src = `scans/${orchard_id}/${scan}/${block_id}/${pad(row, 2)}/${pad(bay, 2)}.jpg`
//            let bay_image_link = document.getElementById('bay_image_link')
//            bay_image_link.href = bay_image.src
            let bay_image_link_2 = document.getElementById('bay_image_link_2')
            bay_image_link_2.href = bay_image.src

            let preview = document.getElementById('preview2')
            preview.style.opacity = '1'
            preview.style.left = '0'
            preview.style.display = 'flex'
//            let preview_info = document.getElementById('preview_info')

            let preview_table = document.getElementById("preview_table")

            let preview_details_left = document.getElementById("preview_table_count")

            let preview_details_1 = document.getElementById("preview_table_details_1")
            let preview_details_2 = document.getElementById("preview_table_details_2")
            let preview_details_3 = document.getElementById("preview_table_details_3")

            let bay_title_table = document.getElementById('bay_title_table')
            let bay_title_block = document.getElementById('bay_title_block')
            let bay_title_rowbay = document.getElementById('bay_title_rowbay')
            let dets = details(hierarchy)
            console.log(dets)
            let desc = ""
            for (let c in dets) {
                let val = dets[c]
                if (val && (!["Orchard", "Block", "Row", "Bay"].includes(c))) {
                    desc += `${c}: ${val}<br/>`
                }
            }
            if (desc === "") {
//                preview_info.innerHTML = '';
//                preview_info.style.opacity = '0';
//                preview_table.innerHTML = '';
                preview_table.style.opacity = '0';
                bay_title_table.innerHTML = '';
                bay_title_table.style.opacity = '0';
            } else {
//                preview_info.innerHTML = desc;
//                preview_info.style.opacity = '1';

//                bay_title.innerHTML = `${dets["Block"].charAt(0).toUpperCase() + dets["Block"].slice(1)}, Row ${dets["Row"]}, Bay ${dets["Bay"]}`;
                bay_title_block.innerHTML = `${dets["Block"]}`;
                bay_title_rowbay.innerHTML = `Row ${dets["Row"]}, Bay ${dets["Bay"]}`;

                left_text = dets["Kiwifruit (2021-03-25) Count"].split('(')[1].split(')')[0]

                preview_details_left.innerHTML = `<br>${left_text}`;

                preview_details_1.innerHTML = `${dets["Kiwifruit (2021-03-25) Count"]}`.split('(')[0] + '<span class="icon-fruit"></span>';
                preview_details_2.innerHTML = `${dets["Area"]}<span class="icon-area"></span>`;
                preview_details_3.innerHTML = `${dets["Location"]}<span class="icon-pin"></span>`;
                preview_table.style.opacity = '1';

                bay_title_table.style.opacity = '1';
            }

        // if valid item not selected, hide preview panel
        } else {
            let preview = document.getElementById('preview2')
            preview.style.opacity = '0'
            preview.style.display = 'none'
            preview.style.left = '-24.4vw'
        }
    }
)
let info = document.getElementById('info')

document.getElementById('count-class')
    .addEventListener('change', function () {
        let counter = document.getElementById('count-class').value
        console.log("changed to ", counter)

        let q = parseQuery(location.search)
        q['count'] = counter;
        window.history.pushState({}, '', location.pathname + makeQuery(q));

        vectorLayer.setStyle(objectStyle);
    });


colors.forEach((colorField, i) => {
        let counter = parseFloat(colorField[1].value)
        if (i !== 0) {
            colors[i - 1][1].max = counter - 1
        }
        if (i !== colors.length - 1) {
            colors[i + 1][1].min = counter + 1
        }
        colorField[1].addEventListener('change', function () {
            let counter = parseFloat(colorField[1].value)
            if (i !== 0) {
                colors[i - 1][1].max = counter - 1
            }
            if (i !== colors.length - 1) {
                colors[i + 1][1].min = counter + 1
            }
            console.log(colorField[0], colorField[1].id, " changed to ", counter)

            let q = parseQuery(location.search)
            q[`color_${i}`] = counter
            window.history.replaceState({}, '', location.pathname + makeQuery(q))

            vectorLayer.setStyle(objectStyle);
        })
    }
)

function showInfo(event) {
    let features = map.getFeaturesAtPixel(event.pixel);
    if (features.length === 0) {
        info.innerText = ''
        info.style.opacity = '0'
        return;
    }
    let dets = details(features)
    delete dets["Orchard"]
    delete dets["Block"]
    console.log("FEATURES", features)
    console.log("DETS", dets)
    let desc = ""
    let row_desc = ""
    for (let c in dets) {
        let val = dets[c]
        console.log("dets["+String(c)+"]", dets[c])
        if (String(c) == "Row") {
            row_desc = `${c}: ${val}, `
        } else if (String(c) == "Bay") {
            desc += row_desc + `${c}: ${val}<br/>`
        } else if (String(c).includes("Count")) {
            desc += `Count: ${val}<br/>`
        } else {
            if (val) {
                desc += `${c}: ${val}<br/>`
            }
        }
    }
    if (desc === "") {
        info.innerHTML = '';
        info.style.opacity = '0';
    } else {
        info.innerHTML = desc;
        info.style.opacity = '1';
    }
}