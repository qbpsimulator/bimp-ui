var QBPApi_Module_Factory = function () {
  var QBPApi = {
    name: 'QBPApi',
    defaultElementNamespaceURI: 'http:\/\/www.qbp-simulator.com\/ApiSchema201212',
    typeInfos: [{
        localName: 'ResourceKPIType',
        propertyInfos: [{
            name: 'utilization',
            required: true,
            typeInfo: 'Double'
          }, {
            name: 'id',
            attributeName: {
              localPart: 'id'
            },
            type: 'attribute'
          }]
      }, {
        localName: 'HistogramDataType.Values',
        typeName: null,
        propertyInfos: [{
            name: 'value',
            minOccurs: 0,
            collection: true,
            typeInfo: 'Double'
          }]
      }, {
        localName: 'StartSimulationRequest',
        typeName: null,
        propertyInfos: [{
            name: 'modelData',
            required: true,
            collection: true
          }, {
            name: 'version',
            typeInfo: 'Float',
            attributeName: {
              localPart: 'version'
            },
            type: 'attribute'
          }, {
            name: 'generateMXML',
            typeInfo: 'Boolean',
            attributeName: {
              localPart: 'generateMXML'
            },
            type: 'attribute'
          }]
      }, {
        localName: 'SimulationKPIResponse',
        typeName: null,
        baseTypeInfo: '.SimulationKPIType'
      }, {
        localName: 'SimulationSimulatorStatsResponse',
        typeName: null,
        baseTypeInfo: '.SimulationSimulatorStatsType',
        propertyInfos: [{
            name: 'version',
            typeInfo: 'Float',
            attributeName: {
              localPart: 'version'
            },
            type: 'attribute'
          }]
      }, {
        localName: 'SimulationKPIType',
        propertyInfos: [{
            name: 'process',
            required: true,
            typeInfo: '.ProcessKPIType'
          }, {
            name: 'elements',
            required: true,
            typeInfo: '.SimulationKPIType.Elements'
          }, {
            name: 'resources',
            required: true,
            typeInfo: '.SimulationKPIType.Resources'
          }, {
            name: 'version',
            typeInfo: 'Float',
            attributeName: {
              localPart: 'version'
            },
            type: 'attribute'
          }]
      }, {
        localName: 'SimulationStatusResponse',
        typeName: null,
        propertyInfos: [{
            name: 'status',
            required: true,
            typeInfo: '.SimulationStatusType'
          }, {
            name: 'version',
            typeInfo: 'Float',
            attributeName: {
              localPart: 'version'
            },
            type: 'attribute'
          }]
      }, {
        localName: 'HistogramDataType',
        propertyInfos: [{
            name: 'min',
            required: true,
            typeInfo: 'Double'
          }, {
            name: 'max',
            required: true,
            typeInfo: 'Double'
          }, {
            name: 'binWidth',
            required: true,
            typeInfo: 'Double'
          }, {
            name: 'values',
            required: true,
            typeInfo: '.HistogramDataType.Values'
          }]
      }, {
        localName: 'StartSimulationResponse',
        typeName: null,
        propertyInfos: [{
            name: 'status',
            required: true,
            typeInfo: '.SimulationStatusType'
          }, {
            name: 'id',
            attributeName: {
              localPart: 'id'
            },
            type: 'attribute'
          }, {
            name: 'version',
            typeInfo: 'Float',
            attributeName: {
              localPart: 'version'
            },
            type: 'attribute'
          }]
      }, {
        localName: 'ElementKPIType',
        propertyInfos: [{
            name: 'duration',
            required: true,
            typeInfo: '.StatsValueType'
          }, {
            name: 'cost',
            required: true,
            typeInfo: '.StatsValueType'
          }, {
            name: 'waitingTime',
            required: true,
            typeInfo: '.StatsValueType'
          }, {
            name: 'idleTime',
            required: true,
            typeInfo: '.StatsValueType'
          }, {
            name: 'costOverThreshold',
            required: true,
            typeInfo: '.StatsValueType'
          }, {
            name: 'durationOverThreshold',
            required: true,
            typeInfo: '.StatsValueType'
          }, {
            name: 'count',
            required: true,
            typeInfo: 'Int'
          }, {
            name: 'id',
            attributeName: {
              localPart: 'id'
            },
            type: 'attribute'
          }, {
            name: 'name',
            attributeName: {
              localPart: 'name'
            },
            type: 'attribute'
          }]
      }, {
        localName: 'StatsValueType',
        propertyInfos: [{
            name: 'min',
            required: true,
            typeInfo: 'Double'
          }, {
            name: 'max',
            required: true,
            typeInfo: 'Double'
          }, {
            name: 'average',
            required: true,
            typeInfo: 'Double'
          }]
      }, {
        localName: 'SimulationSimulatorStatsType',
        propertyInfos: [{
            name: 'enabled',
            required: true,
            typeInfo: 'Int'
          }, {
            name: 'started',
            required: true,
            typeInfo: 'Int'
          }, {
            name: 'completed',
            required: true,
            typeInfo: 'Int'
          }, {
            name: 'startTime',
            required: true,
            typeInfo: 'Long'
          }, {
            name: 'endTime',
            required: true,
            typeInfo: 'Long'
          }, {
            name: 'processedElements',
            required: true,
            typeInfo: 'Int'
          }]
      }, {
        localName: 'SimulationKPIType.Elements',
        typeName: null,
        propertyInfos: [{
            name: 'element',
            minOccurs: 0,
            collection: true,
            typeInfo: '.ElementKPIType'
          }]
      }, {
        localName: 'ProcessKPIType',
        propertyInfos: [{
            name: 'minCycleTime',
            typeInfo: 'Double'
          }, {
            name: 'averageCycleTime',
            typeInfo: 'Double'
          }, {
            name: 'maxCycleTime',
            typeInfo: 'Double'
          }, {
            name: 'totalCycleTime',
            typeInfo: 'Double'
          }, {
            name: 'minCost',
            typeInfo: 'Double'
          }, {
            name: 'averageCost',
            typeInfo: 'Double'
          }, {
            name: 'maxCost',
            typeInfo: 'Double'
          }, {
            name: 'totalCost',
            typeInfo: 'Double'
          }, {
            name: 'minDuration',
            typeInfo: 'Double'
          }, {
            name: 'averageDuration',
            typeInfo: 'Double'
          }, {
            name: 'maxDuration',
            typeInfo: 'Double'
          }, {
            name: 'processInstances',
            typeInfo: 'Int'
          }]
      }, {
        localName: 'SimulationHistogramResponse',
        typeName: null,
        baseTypeInfo: '.HistogramDataType',
        propertyInfos: [{
            name: 'version',
            typeInfo: 'Float',
            attributeName: {
              localPart: 'version'
            },
            type: 'attribute'
          }]
      }, {
        localName: 'ResultsType',
        propertyInfos: [{
            name: 'results',
            required: true,
            elementName: 'Results',
            typeInfo: '.SimulationKPIType'
          }, {
            name: 'cycleTimesData',
            elementName: 'CycleTimesData',
            typeInfo: '.HistogramDataType'
          }, {
            name: 'cycleTimesInTimetableData',
            elementName: 'CycleTimesInTimetableData',
            typeInfo: '.HistogramDataType'
          }, {
            name: 'waitingTimesData',
            elementName: 'WaitingTimesData',
            typeInfo: '.HistogramDataType'
          }, {
            name: 'costsData',
            elementName: 'CostsData',
            typeInfo: '.HistogramDataType'
          }]
      }, {
        localName: 'Results',
        typeName: null,
        baseTypeInfo: '.ResultsType',
        propertyInfos: [{
            name: 'version',
            typeInfo: 'Float',
            attributeName: {
              localPart: 'version'
            },
            type: 'attribute'
          }]
      }, {
        localName: 'SimulationStatusType',
        propertyInfos: [{
            name: 'errorDetails'
          }, {
            name: 'status',
            attributeName: {
              localPart: 'status'
            },
            type: 'attribute'
          }, {
            name: 'error',
            attributeName: {
              localPart: 'error'
            },
            type: 'attribute'
          }, {
            name: 'completed',
            typeInfo: 'Int',
            attributeName: {
              localPart: 'completed'
            },
            type: 'attribute'
          }, {
            name: 'total',
            typeInfo: 'Int',
            attributeName: {
              localPart: 'total'
            },
            type: 'attribute'
          }]
      }, {
        localName: 'SimulationKPIType.Resources',
        typeName: null,
        propertyInfos: [{
            name: 'resource',
            minOccurs: 0,
            collection: true,
            typeInfo: '.ResourceKPIType'
          }]
      }, {
        type: 'enumInfo',
        localName: 'SimulationError',
        values: ['INVALID_INPUT', 'SIMULATION_ERROR', 'IO_ERROR']
      }, {
        type: 'enumInfo',
        localName: 'SimulationStatus',
        values: ['QUEUED', 'RUNNING', 'FAILED', 'FINALIZING', 'COMPLETED']
      }],
    elementInfos: [{
        elementName: 'StartSimulationResponse',
        typeInfo: '.StartSimulationResponse'
      }, {
        elementName: 'Results',
        typeInfo: '.Results'
      }, {
        elementName: 'SimulationKPIResponse',
        typeInfo: '.SimulationKPIResponse'
      }, {
        elementName: 'StartSimulationRequest',
        typeInfo: '.StartSimulationRequest'
      }, {
        elementName: 'SimulationSimulatorStatsResponse',
        typeInfo: '.SimulationSimulatorStatsResponse'
      }, {
        elementName: 'SimulationHistogramResponse',
        typeInfo: '.SimulationHistogramResponse'
      }, {
        elementName: 'SimulationStatusResponse',
        typeInfo: '.SimulationStatusResponse'
      }]
  };
  return {
    QBPApi: QBPApi
  };
};
if (typeof define === 'function' && define.amd) {
  define([], QBPApi_Module_Factory);
}
else {
  var QBPApi_Module = QBPApi_Module_Factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports.QBPApi = QBPApi_Module.QBPApi;
  }
  else {
    var QBPApi = QBPApi_Module.QBPApi;
  }
}