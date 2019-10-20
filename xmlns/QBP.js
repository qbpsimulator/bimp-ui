var QBP_Module_Factory = function () {
  var QBP = {
    name: 'QBP',
    defaultElementNamespaceURI: 'http:\/\/www.qbp-simulator.com\/Schema201212',
    typeInfos: [{
        localName: 'TimeTable',
        propertyInfos: [{
            name: 'rules',
            required: true,
            typeInfo: '.TimeTable.Rules'
          }, {
            name: 'id',
            required: true,
            typeInfo: 'ID',
            attributeName: {
              localPart: 'id'
            },
            type: 'attribute'
          }, {
            name: '_default',
            typeInfo: 'Boolean',
            attributeName: {
              localPart: 'default'
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
        localName: 'ProcessSimulationInfo',
        typeName: null,
        baseTypeInfo: '.ProcessSimulationInfoType'
      }, {
        localName: 'ElementSimulationInfoType.ResourceIds',
        typeName: null,
        propertyInfos: [{
            name: 'resourceId',
            required: true
          }]
      }, {
        localName: 'Resource',
        propertyInfos: [{
            name: 'id',
            required: true,
            typeInfo: 'ID',
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
          }, {
            name: 'totalAmount',
            typeInfo: 'Int',
            attributeName: {
              localPart: 'totalAmount'
            },
            type: 'attribute'
          }, {
            name: 'costPerHour',
            typeInfo: 'Double',
            attributeName: {
              localPart: 'costPerHour'
            },
            type: 'attribute'
          }, {
            name: 'timetableId',
            attributeName: {
              localPart: 'timetableId'
            },
            type: 'attribute'
          }]
      }, {
        localName: 'ProcessSimulationInfoType.SequenceFlows',
        typeName: null,
        propertyInfos: [{
            name: 'sequenceFlow',
            required: true,
            collection: true,
            typeInfo: '.SequenceFlowSimulationInfoType'
          }]
      }, {
        localName: 'DistributionInfo',
        propertyInfos: [{
            name: 'histogramDataBins',
            typeInfo: '.DistributionInfo.HistogramDataBins'
          }, {
            name: 'timeUnit'
          }, {
            name: 'type',
            required: true,
            attributeName: {
              localPart: 'type'
            },
            type: 'attribute'
          }, {
            name: 'mean',
            typeInfo: 'Double',
            attributeName: {
              localPart: 'mean'
            },
            type: 'attribute'
          }, {
            name: 'arg1',
            typeInfo: 'Double',
            attributeName: {
              localPart: 'arg1'
            },
            type: 'attribute'
          }, {
            name: 'arg2',
            typeInfo: 'Double',
            attributeName: {
              localPart: 'arg2'
            },
            type: 'attribute'
          }]
      }, {
        localName: 'ProcessSimulationInfoType.Resources',
        typeName: null,
        propertyInfos: [{
            name: 'resource',
            required: true,
            collection: true,
            typeInfo: '.Resource'
          }]
      }, {
        localName: 'ProcessSimulationInfoType.Elements',
        typeName: null,
        propertyInfos: [{
            name: 'element',
            required: true,
            collection: true,
            typeInfo: '.ElementSimulationInfoType'
          }]
      }, {
        localName: 'TimeTable.Rules',
        typeName: null,
        propertyInfos: [{
            name: 'rule',
            required: true,
            collection: true,
            typeInfo: '.TimeTableRule'
          }]
      }, {
        localName: 'DistributionInfo.HistogramDataBins',
        typeName: null,
        propertyInfos: [{
            name: 'histogramData',
            required: true,
            collection: true,
            typeInfo: '.DistributionHistogramBin'
          }]
      }, {
        localName: 'ProcessSimulationInfoType',
        propertyInfos: [{
            name: 'arrivalRateDistribution',
            required: true,
            typeInfo: '.DistributionInfo'
          }, {
            name: 'timetables',
            typeInfo: '.ProcessSimulationInfoType.Timetables'
          }, {
            name: 'resources',
            typeInfo: '.ProcessSimulationInfoType.Resources'
          }, {
            name: 'elements',
            typeInfo: '.ProcessSimulationInfoType.Elements'
          }, {
            name: 'sequenceFlows',
            typeInfo: '.ProcessSimulationInfoType.SequenceFlows'
          }, {
            name: 'statsOptions',
            typeInfo: '.StatsOptionsType'
          }, {
            name: 'id',
            attributeName: {
              localPart: 'id'
            },
            type: 'attribute'
          }, {
            name: 'processId',
            attributeName: {
              localPart: 'processId'
            },
            type: 'attribute'
          }, {
            name: 'processInstances',
            required: true,
            typeInfo: 'Int',
            attributeName: {
              localPart: 'processInstances'
            },
            type: 'attribute'
          }, {
            name: 'startDateTime',
            typeInfo: 'DateTime',
            attributeName: {
              localPart: 'startDateTime'
            },
            type: 'attribute'
          }, {
            name: 'currency',
            attributeName: {
              localPart: 'currency'
            },
            type: 'attribute'
          }, {
            name: 'version',
            typeInfo: 'Int',
            attributeName: {
              localPart: 'version'
            },
            type: 'attribute'
          }]
      }, {
        localName: 'DistributionHistogramBin',
        propertyInfos: [{
            name: 'distribution',
            required: true,
            typeInfo: '.DistributionInfo'
          }, {
            name: 'probability',
            typeInfo: 'Double',
            attributeName: {
              localPart: 'probability'
            },
            type: 'attribute'
          }]
      }, {
        localName: 'ProcessSimulationInfoType.Timetables',
        typeName: null,
        propertyInfos: [{
            name: 'timetable',
            required: true,
            collection: true,
            typeInfo: '.TimeTable'
          }]
      }, {
        localName: 'TimeTableRule',
        propertyInfos: [{
            name: 'fromTime',
            required: true,
            typeInfo: 'Time',
            attributeName: {
              localPart: 'fromTime'
            },
            type: 'attribute'
          }, {
            name: 'toTime',
            required: true,
            typeInfo: 'Time',
            attributeName: {
              localPart: 'toTime'
            },
            type: 'attribute'
          }, {
            name: 'fromWeekDay',
            required: true,
            attributeName: {
              localPart: 'fromWeekDay'
            },
            type: 'attribute'
          }, {
            name: 'toWeekDay',
            attributeName: {
              localPart: 'toWeekDay'
            },
            type: 'attribute'
          }]
      }, {
        localName: 'ElementSimulationInfoType',
        propertyInfos: [{
            name: 'durationDistribution',
            required: true,
            typeInfo: '.DistributionInfo'
          }, {
            name: 'resourceIds',
            required: true,
            typeInfo: '.ElementSimulationInfoType.ResourceIds'
          }, {
            name: 'durationThresholdTimeUnit'
          }, {
            name: 'id',
            attributeName: {
              localPart: 'id'
            },
            type: 'attribute'
          }, {
            name: 'elementId',
            required: true,
            attributeName: {
              localPart: 'elementId'
            },
            type: 'attribute'
          }, {
            name: 'fixedCost',
            typeInfo: 'Double',
            attributeName: {
              localPart: 'fixedCost'
            },
            type: 'attribute'
          }, {
            name: 'costThreshold',
            typeInfo: 'Double',
            attributeName: {
              localPart: 'costThreshold'
            },
            type: 'attribute'
          }, {
            name: 'durationThreshold',
            typeInfo: 'Double',
            attributeName: {
              localPart: 'durationThreshold'
            },
            type: 'attribute'
          }, {
            name: 'simulateAsTask',
            typeInfo: 'Boolean',
            attributeName: {
              localPart: 'simulateAsTask'
            },
            type: 'attribute'
          }]
      }, {
        localName: 'SequenceFlowSimulationInfoType',
        propertyInfos: [{
            name: 'elementId',
            required: true,
            attributeName: {
              localPart: 'elementId'
            },
            type: 'attribute'
          }, {
            name: 'executionProbability',
            typeInfo: 'Double',
            attributeName: {
              localPart: 'executionProbability'
            },
            type: 'attribute'
          }]
      }, {
        localName: 'StatsOptionsType',
        propertyInfos: [{
            name: 'trimStartProcessInstances',
            typeInfo: 'Double',
            attributeName: {
              localPart: 'trimStartProcessInstances'
            },
            type: 'attribute'
          }, {
            name: 'trimEndProcessInstances',
            typeInfo: 'Double',
            attributeName: {
              localPart: 'trimEndProcessInstances'
            },
            type: 'attribute'
          }]
      }, {
        type: 'enumInfo',
        localName: 'DistributionType',
        values: ['FIXED', 'EXPONENTIAL', 'GAMMA', 'LOGNORMAL', 'NORMAL', 'TRIANGULAR', 'UNIFORM', 'HISTOGRAM']
      }, {
        type: 'enumInfo',
        localName: 'WeekDay',
        values: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']
      }],
    elementInfos: [{
        elementName: 'processSimulationInfo',
        typeInfo: '.ProcessSimulationInfo'
      }]
  };
  return {
    QBP: QBP
  };
};
if (typeof define === 'function' && define.amd) {
  define([], QBP_Module_Factory);
}
else {
  var QBP_Module = QBP_Module_Factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports.QBP = QBP_Module.QBP;
  }
  else {
    var QBP = QBP_Module.QBP;
  }
}