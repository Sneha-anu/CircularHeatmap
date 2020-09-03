import { Component, Input, ViewChild, OnChanges } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { SetScaleComponent } from '../set-scale/set-scale.component';
import { Kriging } from '../shared/kriging';

@Component({
  selector: 'app-circular-heatmap',
  templateUrl: './circular-heatmap.component.html',
})
export class CircularHeatmapComponent implements OnChanges {
  isContour = false;
  minValue: any;
  maxValue: any;
  fixedNotch = 22;
  private minVal: any;
  private maxVal: any;
  colorscale: any;
  isAutoScale = true;
  constructor(public dialog: MatDialog, public krigingService: Kriging) {}
  public graph: any;
  @Input() x: any[];
  @Input() y: any[];
  @Input() dataTemp: any[];
  @Input() setInterpolate: boolean = false;
  @ViewChild(MatMenuTrigger) contextMenu: MatMenuTrigger;
  contextMenuPosition = { x: '0px', y: '0px' };
  public x21;
  public y21;
  public points;
  public length;
  public data21;
  public xInterp;
  public yInterp;
  public degree = 22;
  public threeDGraph: any;
  public show3DGraph = false;
  public noOfGrid = 128;
  public dataOverlay = true;
  public dataOverlayTemp;
  public notchFromPositiveXAxis = 247.5;
  public isFixedNotch = true;

  /**
   * On change event
   */
  ngOnChanges() {
    this.x21 = [];
    this.y21 = [];
    this.x.map((x, index) => {
      let radius = Math.sqrt(x * x + this.y[index] * this.y[index]);
      const theta = Math.atan2(this.y[index], x);
      const rotatedRadian = (this.fixedNotch * Math.PI) / 180;
      const rotatedTheta = theta + rotatedRadian;
      this.x21.push(radius * Math.cos(rotatedTheta));
      this.y21.push(radius * Math.sin(rotatedTheta));
    });

    this.data21 = this.dataTemp;
    this.xInterp = this.krigingService.makeArr(
      this.x21.reduce((a, b) => Math.min(a, b)),
      this.x21.reduce((a, b) => Math.max(a, b)),
      this.noOfGrid
    );
    this.yInterp = this.krigingService.makeArr(
      this.y21.reduce((a, b) => Math.min(a, b)),
      this.y21.reduce((a, b) => Math.max(a, b)),
      this.noOfGrid
    );

    let interpolatedMatrix = this.krigingService.constructInterpolatedMatrix(
      this.x21,
      this.y21,
      this.xInterp,
      this.yInterp,
      this.data21
    );
    let predictedGridValue = this.krigingService.convertToGridMatrix(
      interpolatedMatrix,
      this.noOfGrid,
      this.noOfGrid
    );
    this.setGraphData(predictedGridValue);
  }

  changeFixedNotch() {
    this.isFixedNotch = !this.isFixedNotch;
    if (this.isFixedNotch) {
      this.degree = this.fixedNotch;
      this.rotateDegree();
    }
  }

  showAutoScale() {
    this.graph.data[0].colorscale = this.colorscale;
    this.graph.data[0].zmin = this.minVal;
    this.graph.data[0].zmax = this.maxVal;
  }

  /**
   * Render the contex menu
   * @param event - event when the context menu triggered
   */
  renderContextMenuItems(event) {
    event.preventDefault();
    this.contextMenuPosition.x = event.clientX + 'px';
    this.contextMenuPosition.y = event.clientY + 'px';
    this.contextMenu.menu.focusFirstItem('mouse');
    this.contextMenu.openMenu();
  }

  /**
   * Context menu actions - Set scale and Auto Scale
   * @param isAutoScale - Wheter auto scaled or not.
   */
  onContextMenuAction(isAutoScale) {
    this.isAutoScale = isAutoScale;
    if (isAutoScale) {
      this.graph.data[0].colorscale = this.colorscale;
      this.graph.data[0].zmin = this.minVal;
      this.graph.data[0].zmax = this.maxVal;
    } else {
      const dialogRef = this.dialog.open(SetScaleComponent, {
        data: { min: this.minValue, max: this.maxValue },
      });

      dialogRef.afterClosed().subscribe((result) => {
        this.minValue = result.min;
        this.maxValue = result.max;
        let dataScale = this.krigingService.GetScale(result.max, result.min);
        let colors = this.krigingService.GenerateWavelengthColorMap(
          dataScale.length
        );

        let colorscale = [];
        let colorScaleData = this.krigingService.makeArr(
          0,
          1,
          dataScale.length
        );
        colorScaleData.map((data, clIndex) => {
          colorscale.push([data, colors[clIndex]]);
        });

        this.graph.data[0].zmin = this.minValue;
        this.graph.data[0].zmax = this.maxValue;
        this.graph.data[0].colorscale = colorscale;
      });
    }
  }

  /**
   * Show the 3D graph
   */
  showcurrent3DGraph() {
    this.show3DGraph = !this.show3DGraph;
  }

  /**
   * To set the graph data with the predicted value, xinterpolated and y interpolated
   * @param predictedGridValue - predicted value to be set in plotly graph
   */
  setGraphData(predictedGridValue) {
    let distSquared, xTrans, yTrans, theta;
    const radius64 =
      (this.x21.reduce((a, b) => Math.max(a, b)) +
        this.y21.reduce((a, b) => Math.max(a, b))) /
      2;

    for (let i = 0; i < this.data21.length; i++) {
      let { x, y } = this.krigingService.changeCircleToSquare(
        this.x21[i],
        this.y21[i]
      );
      xTrans = -radius64 + x;
      yTrans = -radius64 + y;

      distSquared = Math.pow(x, 2.0) + Math.pow(y, 2.0);

      if (Math.sqrt(distSquared) > radius64) {
        theta = Math.atan2(y, x);
        x = radius64 * Math.cos(theta);
        y = radius64 * Math.sin(theta);
      }
      this.x21[i] = x;
      this.y21[i] = y;
    }

    let texts = [];

    const notchinRadian =
      ((360 - this.notchFromPositiveXAxis + this.fixedNotch) * Math.PI) / 180;
    const notchX = radius64 * Math.cos(notchinRadian);
    const notchY = radius64 * Math.sin(notchinRadian);

    this.dataTemp.map((data, index) => {
      texts.push(data.toFixed(2));
    });

    let minimumValue = [];
    let maximumValue = [];

    predictedGridValue.map((data) => {
      minimumValue.push(data.reduce((a, b) => Math.min(a, b)));
      maximumValue.push(data.reduce((a, b) => Math.max(a, b)));
    });

    for (let i = 0; i < this.noOfGrid; i++) {
      for (let j = 0; j < this.noOfGrid; j++) {
        let x = this.xInterp[i];
        let y = this.yInterp[j];
        distSquared = Math.pow(x, 2.0) + Math.pow(y, 2.0);
        if (distSquared > radius64 * radius64) {
          predictedGridValue[i][j] = null;
        }
      }
    }
    this.maxValue = this.maxVal = maximumValue.reduce((a, b) => Math.max(a, b));
    this.minValue = this.minVal = minimumValue.reduce((a, b) => Math.min(a, b));

    let dataScale = this.krigingService.GetScale(this.maxValue, this.minValue);

    let colors = this.krigingService.GenerateWavelengthColorMap(
      dataScale.length
    );

    this.colorscale = [];
    let colorScaleData = this.krigingService.makeArr(0, 1, dataScale.length);
    colorScaleData.map((data, index) => {
      this.colorscale.push([data, colors[index]]);
    });

    this.graph = {
      data: [
        {
          x: this.xInterp,
          y: this.yInterp,
          z: predictedGridValue,
          y0: 0,
          dy: 1,
          x0: 0,
          dx: 1,
          type: this.isContour ? 'contour' : 'heatmap',
          ncontours: 21,
          zmin: minimumValue,
          zmax: maximumValue,
          colorscale: this.colorscale,
          contours: {
            // start: 0,
            // end: 8,
            coloring: 'heatmap',
            size: 2,
          },
        },
      ],
      layout: {
        title: 'KRIG Heatmap',

        height: 400,
        width: 400,
        xaxis: {
          showgrid: false,
          zeroline: false,
          showline: false,
          autotick: true,
          ticks: '',
          showticklabels: false,
        },
        yaxis: {
          showgrid: false,
          zeroline: false,
          showline: false,
          autotick: true,
          ticks: '',
          showticklabels: false,
        },
        shapes: [
          {
            type: 'circle',
            xref: 'x',
            yref: 'y',
            x0: this.xInterp.reduce((a, b) => Math.min(a, b)),
            y0: this.yInterp.reduce((a, b) => Math.min(a, b)),
            x1: this.xInterp.reduce((a, b) => Math.max(a, b)),
            y1: this.yInterp.reduce((a, b) => Math.max(a, b)),
            line: {
              color: 'rgba(0,0,0,50)',
              width: 1,
            },
          },
        ],
      },
    };

    if (this.dataOverlay) {
      this.graph.data.push({
        x: this.x21,
        y: this.y21,
        z: this.data21,
        mode: 'markers+text',
        showscale: false,
        marker: {
          color: '#5a585c',
          size: 5,
        },
        text: texts,
        texttemplate: '%{text}',
        textfont: {
          color: 'black',
          size: 9.5,
        },
        textposition: 'top center',
      });
    }

    this.threeDGraph = {
      data: [
        {
          z: predictedGridValue,
          colorscale: this.colorscale,
          type: 'surface',
          contours: {
            z: {
              show: this.isContour,
              usecolormap: false,
              project: { y: true },
            },
          },
        },
      ],
      layout: {
        title: '3D Elevation',
        autosize: false,
        width: 450,
        height: 450,
        margin: {
          l: 65,
          r: 50,
          b: 65,
          t: 90,
        },
      },
    };
  }

  /**
   * If the data overlay is checked or unchecked,
   * the data overlay has to be shown or hidden accordingly
   */
  dataOverlayChange() {
    this.dataOverlay = !this.dataOverlay;
    if (this.dataOverlay) {
      this.graph.data.push(this.dataOverlayTemp);
    } else {
      this.dataOverlayTemp = this.graph.data[1];
      this.graph.data = [this.graph.data[0]];
    }
  }

  /**
   * If Contour check box is checked or checked,
   * contour lines has to be added and deleted accordingly
   */
  contourChange() {
    this.isContour = !this.isContour;
    if (this.isContour) {
      this.graph.data[0].type = 'contour';
      this.threeDGraph.data[0].contours.z.show = true;
    } else {
      this.threeDGraph.data[0].contours.z.show = false;
      this.graph.data[0].type = 'heatmap';
    }
  }

  /**
   * Rotate the heatmap using degree
   */
  rotateDegree() {
    let xnew = [];
    let ynew = [];
    this.x.map((x, index) => {
      let radius = Math.sqrt(x * x + this.y[index] * this.y[index]);
      const theta = Math.atan2(this.y[index], x);
      const rotatedRadian = (this.degree * Math.PI) / 180;
      const rotatedTheta = theta + rotatedRadian;
      xnew.push(radius * Math.cos(rotatedTheta));
      ynew.push(radius * Math.sin(rotatedTheta));
    });

    this.x21 = xnew;
    this.y21 = ynew;
    this.xInterp = this.krigingService.makeArr(
      this.x21.reduce((a, b) => Math.min(a, b)),
      this.x21.reduce((a, b) => Math.max(a, b)),
      this.noOfGrid
    );
    this.yInterp = this.krigingService.makeArr(
      this.y21.reduce((a, b) => Math.min(a, b)),
      this.y21.reduce((a, b) => Math.max(a, b)),
      this.noOfGrid
    );

    let interpolatedMatrix = this.krigingService.constructInterpolatedMatrix(
      this.x21,
      this.y21,
      this.xInterp,
      this.yInterp,
      this.data21
    );
    let predictedGridValue = this.krigingService.convertToGridMatrix(
      interpolatedMatrix,
      this.noOfGrid,
      this.noOfGrid
    );
    this.setGraphData(predictedGridValue);
  }
}
