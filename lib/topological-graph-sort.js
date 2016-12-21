/* jshint esversion:6, node:true  */

'use strict';

var _ = require('lodash');

module.exports = topologicalGraphSort;

function topologicalGraphSort() {
  var nodes = {};

  return {
    add: add,
    sort: sort
  };

  function add(destNode, srcNode) {
    var edges = nodes[srcNode] || (nodes[srcNode] = []);
    if (destNode) {
      edges.push(destNode);
    }    
  }

  function sort() {   
    var TEMP = 1;
    var PERM = 2;
    var sorted = [];
    var marks = {};

    _.each(nodes, function(edges, node) {
      if (!marks[node]) {
        visitNode(node);
      }        
    });

    return sorted;

    function visitNode(node) {
      if (marks[node] === TEMP) {
        var cycleError = new Error('CYCLE_GRAPH');
        cycleError.node = node;
        throw cycleError;
      } else if (marks[node]) {
        return;
      }

      marks[node] = TEMP;
      _.each(nodes[node], visitNode);
      marks[node] = PERM;

      sorted.push(node);
    }      
  }
}