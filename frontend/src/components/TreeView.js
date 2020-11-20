import React, {Component} from 'react';
// import logo from './logo.svg';
import '../App.css';
import out from './out.json'
import testData from './testData.json'
import Tree from 'rc-tree';
import styled from 'styled-components'
import 'rc-tree/assets/index.css';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import TreeModel from 'tree-model'
import { uniqueId, last, defaultTo } from 'lodash'
import '../styles/basic.less';

export class TreeView extends Component {
  static propTypes = {
    keys: PropTypes.array,
  };
  constructor(props) {
    super(props);
    const keys = props.keys;
    const tree = new TreeModel({ childrenPropertyName: 'childs'})
    const root = tree.parse(testData)
    root.walk(function rcTreeModelCompatible(node) {
      const {
        name,
        label: { en },
        childs,
      } = node.model

      node.model.key = name
      node.model.title = en
      node.model.children = childs
      node.model.childs = null
    })
    this.root = new TreeModel().parse(root.model);

    this.handleCheckboxShowLine = this.handleCheckboxShowLine.bind(this);
    this.handleCheckboxShow = this.handleCheckboxShow.bind(this);
    this.handleDrag = this.handleDrag.bind(this);
    this.handleMultiSelect = this.handleMultiSelect.bind(this);
    this.handleSelectable = this.handleSelectable.bind(this);

    this.state = {
      defaultExpandedKeys: keys,
      defaultSelectedKeys: keys,
      defaultCheckedKeys: keys,
      treeData: root.model,
      showLine: true,
      editable: false,
      isDraggable: false,
      showCheckbox: true,
      isMultiSelect : false,
      selectable: true,
    };
  }

  handleCheckboxShowLine(e) {
    const checked = e.target.checked;
    this.setState({
        showLine:checked
    });
  }

  handleMultiSelect(e) {
    const checked = e.target.checked;
    this.setState({
      isMultiSelect:checked
    });
  }
  handleSelectable(e) {
    const checked = e.target.checked;
    this.setState({
      selectable:checked
    });
  }
  handleCheckboxShow(e) {
    const checked = e.target.checked;
    this.setState({
        showCheckbox:checked
    });
  }

  handleDrag(e) {
    const checked = e.target.checked;
    this.setState({
        isDraggable:checked
    });
  }
  
  onExpand = expandedKeys => {
    console.log('onExpand', expandedKeys);
    this.setState({
      expandedKeys,
      autoExpandParent: false,
    });
  };


  onSelect = (selectedKeys, info) => {
    console.log('selected', selectedKeys, info);
    this.selKey = info.node.eventKey;

    // if (this.tree) {
    //   console.log(
    //     'Selected DOM node:',
    //     selectedKeys.map(key => ReactDOM.findDOMNode(this.tree.domTreeNodes[key])),
    //   );
    // }
  };

  setTreeRef = (tree) => {
    this.tree = tree;
  };
  onDoubleClick = (event, node) => {
    console.log('double click')
    const internalTree = this.tree
    internalTree.onNodeExpand(event, node)
  }

  onAdd = () => {
    const [selectedKey] = this.tree.state.selectedKeys
    if(!selectedKey) {
      return
    }
    const node = this.root.first(({ model }) => model.key === selectedKey)
    const name = `foo${uniqueId()}`
    node.addChild(new TreeModel().parse({key: name, title: name, children: []}))
    this.setState({ treeData: this.root.model })
  }
  onRemove = () => {
    const [selectedKey] = this.tree.state.selectedKeys
    if(!selectedKey) {
      return
    }
    const node = this.root.first(({ model }) => model.key === selectedKey)
    this.tree.setState({ selectedKeys: [] })
    node.drop()
    this.setState({ treeData: this.root.model })
  }
  onDrop = ({ node, dragNodesKeys, dropToGap, dropPosition, ...rest }) => {
    const sourceKey = last(dragNodesKeys)
    const { name: destinationKey } = node
    const sourceNode = this.root.first(({ model }) => model.key === sourceKey)
    const destinationNode = this.root.first(({ model }) => model.key === destinationKey)
    const sourceNodeClone = new TreeModel().parse(sourceNode.model)
    const dropPositionNormalized = dropPosition < 0 ? 0: dropPosition
    console.log(destinationNode)
    if(dropToGap) {
      const parent = defaultTo(destinationNode.parent, this.root)
      parent.addChildAtIndex(sourceNodeClone, dropPositionNormalized)
    }
    else {
      destinationNode.addChild(sourceNodeClone)
    }
    sourceNode.drop()
    this.setState({ treeData: this.root.model })
  }

  onGoUp = () => {
    const [selectedKey] = this.tree.state.selectedKeys
    if(!selectedKey) {
      return
    }
    const node = this.root.first(({ model }) => model.key === selectedKey)
    const newIndex = node.getIndex() - 1
    if(newIndex < 0) {
      return
    }
    node.setIndex(newIndex)
    this.setState({ treeData: this.root.model })
  }
  onGoDown = () => {
    const [selectedKey] = this.tree.state.selectedKeys
    if(!selectedKey) {
      return
    }
    const node = this.root.first(({ model }) => model.key === selectedKey)
    const newIndex = node.getIndex() + 1
    if(newIndex >= node.parent.model.children.length) {
      return
    }
    node.setIndex(newIndex)
    this.setState({ treeData: this.root.model })
  }

  onEdit = () => {
    setTimeout(() => {
      console.log('current key: ', this.selKey);
    }, 0);
  };

  
  render() {
    return (
      <div style={{ margin: '0 20px' }}>
      <h2>DBPRO</h2>
      <div>
      <b>Show lines</b>
        &nbsp;&nbsp;
        <label className="switch"> 
        <input type="checkbox"  checked={this.state.showLine} onChange={this.handleCheckboxShowLine}/> 
        <span className="slider round"></span>
      </label>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <b>Checkable</b>
      &nbsp;&nbsp;
      <label className="switch">
        <input type="checkbox" checked={this.state.showCheckbox} onChange={this.handleCheckboxShow} /> 
        <span className="slider round"></span>
      </label>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <b> Drag and Drop</b>
      &nbsp;&nbsp;
      <label className="switch">
        <input type="checkbox" checked={this.state.isDraggable} onChange={this.handleDrag}/> 
        <span className="slider "></span>
      </label>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <button onClick={this.onAdd}>Add</button>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <button onClick={this.onRemove}>Remove</button>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <button onClick={this.onGoUp}>Up</button>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <button onClick={this.onGoDown}>Down</button>

        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <b>Selectable</b>
         &nbsp;&nbsp;
        <label className="switch">
          <input type="checkbox" checked={this.state.selectable} onChange={this.handleSelectable} /> 
          <span className="slider round "></span>
        </label>
      </div>
      <div className="draggable-container">
        <TreeStyled
          showLine={this.state.showLine}
          checkable={this.state.showCheckbox}
          selectable={ this.state.selectable }
          draggable={this.state.isDraggable}
          defaultExpandedKeys={[testData.name]}
          onExpand={this.onExpand}
          onDrop={this.onDrop}
          defaultSelectedKeys={this.state.defaultSelectedKeys}
          defaultCheckedKeys={this.state.defaultCheckedKeys}
          onSelect={this.onSelect}
          onCheck={this.onCheck}
          multiple={this.isMultiSelect}
          treeData={[this.state.treeData]}
          onDoubleClick={this.onDoubleClick}
          ref={this.setTreeRef}
          height={500}
          itemHeight={20}
          style={{ border: '2px solid #0001' }}
        />
      </div>
      </div>
    );
  }
}

const TreeStyled = styled(Tree)`
  /* button size */
  li[role="treeitem"], .rc-tree-title {
    padding: 5px 0;
  }
  .rc-tree-node-selected, .rc-tree-node-content-wrapper:hover {
    background-color: lightblue;
    border: none;
  }
  .rc-tree-node-selected {
    font-weight: bolder;
  }
`

export default TreeView;
