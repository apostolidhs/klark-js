/* jshint esversion:6, node:true  */

'use strict';

const _ = require('lodash');

module.exports = topologicalGraphSort;

function topologicalGraphSort() {
  const nodes = {};

  return {
    add,
    sort
  };

  function add(destNode, srcNode) {
    const edges = nodes[srcNode] || (nodes[srcNode] = []);
    if (destNode) {
      edges.push(destNode);
    }    
  }

  function sort() {   
    const TEMP = 1;
    const PERM = 2;
    const sorted = [];
    const marks = {};

    _.each(nodes, (edges, node) => {
      if (!marks[node]) {
        visitNode(node);
      }        
    });

    return sorted;

    function visitNode(node) {
      if (marks[node] === TEMP) {
        const cycleError = new Error('CYCLE_GRAPH');
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