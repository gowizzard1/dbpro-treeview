import React, {Component} from 'react';
// import logo from './logo.svg';
import '../App.css';
import out from './out.json'
import testData from './testData.json'
import Tree from 'rc-tree';
import styled from 'styled-components'
import 'rc-tree/assets/index.css';
import PropTypes from 'prop-types';
import TreeModel,{TreeNode} from 'tree-model'
import { uniqueId, last, defaultTo } from 'lodash'
import '../styles/basic.less';
import {Row,Form} from 'reactstrap'

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
      eventType: "",
      searchVal: "rest",
    };
  }


  filterTreeNode = (tree, searchKey)=>{
    let newTree = tree.filter(node => {
        node.children = this.filterTreeNode(node.children, searchKey)
        if (node.children.length > 0) {
            return true
        }
        let is_has = this.checkFilterMapping(node, searchKey)
        return is_has
    });
    return newTree
}

 checkFilterMapping=(originVal, checkVal) =>{
    let has_name = false;
    let has_code = false;
    let has_handler = false;
    if (originVal.name) {
        has_name = originVal.name.toLowerCase().indexOf(checkVal.toLowerCase()) > -1
    }
    if (originVal.code) {
        has_code = originVal.code.indexOf(checkVal) > -1
    }
    if (originVal.handler) {
        has_handler = originVal.handler.indexOf(checkVal) > -1
    }
    return has_name || has_code || has_handler
}

  handleCheckboxShowLine(e) {
    const checked = e.target.checked;
    this.setState({
        showLine:checked
    });
  }

  handleMultiSelect(e) {
    const checked = e.target.checked;
    if(checked){
      this.setState({
        selectable: checked
      })
    }
    this.setState({
      isMultiSelect:checked
    });
    if(!checked){
      console.log("unselect here")
    }
  }
  handleSelectable(e) {
    const checked = e.target.checked;
    this.setState({
      selectable:checked
    });
    console.log(e)
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

  onCheck = (selectedKeys, info) => {
    console.log('checked', selectedKeys, info);
    // this.selKey = info.node.eventKey;
}


  onSelect = (selectedKeys, info) => {
    this.setState({
      eventType:"onSelect"
  });
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
    this.setState({
        eventType:"onDoubleClick"
    });
    console.log('double click')
    const internalTree = this.tree
    internalTree.onNodeExpand(event, node)
  }

  onAdd = () => {
    this.setState({
      eventType:"onAdd"
  });
    const [selectedKey] = this.tree.state.selectedKeys
    if(selectedKey == undefined) {
      return
    }
    const node = this.root.first(({ model }) => model.key === selectedKey)
    const name = `newNode${uniqueId()}`
    node.addChild(new TreeModel().parse({key: name, title: name, children: []}))
    this.setState({ treeData: this.root.model })
  }

  onRemove = () => {
    this.setState({
      eventType:"onRemove"
  });
    const selectedKey = this.tree.state.selectedKeys
    if(selectedKey.length < 1 ) {
      return
    }
    const r = window.confirm("Do you really want to Remove " + selectedKey +"?"); if(r == false){ return }
     var i;
     for (i = 0; i < selectedKey.length; i++) {
      console.log(selectedKey[i]);
    const node = this.root.first(({ model }) => model.key === selectedKey[i])
    this.tree.setState({ selectedKeys: [] })
    node.drop()
    this.setState({ treeData: this.root.model })
    }
  
  }

  onDrop = ({ node, dragNodesKeys, dropToGap, dropPosition, ...rest }) => {
    this.setState({
      eventType:"onDrop"
  });
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
    this.setState({
      eventType:"onGoUp"
      });
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
    this.setState({
      eventType:"onGoDown"
    });
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
  }

  onSearch = () =>{
    const searchVal = this.state.searchVal
    const node = this.root.first(({ model }) => model.name === searchVal)
    this.setState({
      treeData:node
    });
  }

  onDestroy1 = () =>{
    //destroy
    const name = "Root"
    const node = new TreeModel().parse({key: name, title: name,name:name, children: null})
    this.root = node
    this.setState({
      treeData: this.root.model
    })
  }

  OnRefresh = () =>{
    this.setState({
      eventType:"onRefresh"
    });
    //refresh
    this.setState({
      treeData:this.state.treeData
    })
  }

  onDestroy = () =>{
    this.setState({
      eventType:"onDestroy"
    });
    const r = window.confirm("Do you really want to Destroy Tree?"); if(r == false){ return }
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
    this.setState({
      treeData:root.model
    })
  }

  OnSort = () =>{
    // this.treeData.model.
  }
  
  render() {
    return (
     <div style={{ margin: '0px 30px', width:'870px'}}>
      <h2>DBPRO</h2>
   <Row>
      <b>Show lines</b>
        &nbsp;&nbsp;
        <label className="switch"> 
        <input type="checkbox"  checked={this.state.showLine} onChange={this.handleCheckboxShowLine}/> 
        <span className="slider round"></span>
      </label>
      &nbsp;&nbsp;&nbsp;&nbsp;
      <b>Checkable</b>
      &nbsp;&nbsp;
      <label className="switch">
        <input type="checkbox" checked={this.state.showCheckbox} onChange={this.handleCheckboxShow} /> 
        <span className="slider round"></span>
      </label>
      &nbsp;&nbsp;&nbsp;&nbsp;
      <b> Drag and Drop</b>
      &nbsp;&nbsp;
      <label className="switch">
        <input type="checkbox" checked={this.state.isDraggable} onChange={this.handleDrag}/> 
        <span className="slider "></span>
      </label>
   
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <b>Selectable</b>
         &nbsp;&nbsp;
        <label className="switch">
          <input type="checkbox" checked={this.state.selectable} onChange={this.handleSelectable} /> 
          <span className="slider round "></span>
        </label>
        
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <b>MultiSelect</b>
         &nbsp;&nbsp;
        <label className="switch">
          <input type="checkbox" checked={this.state.isMultiSelect} onChange={this.handleMultiSelect} /> 
          <span className="slider round "></span>
        </label>
      </Row>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

      <Row>
        <button onClick={this.onAdd}>Add</button>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <button onClick={this.onRemove}>Remove</button>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <button onClick={this.onGoUp}>Up</button>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <button onClick={this.onGoDown}>Down</button>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <button onClick={this.OnRefresh}>Refresh</button>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <button onClick={this.onDestroy}>Destroy</button>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <button onClick={this.onReinstate}>Test</button>
        </Row>
      
      <Row>
      <div className="draggable-container">
      {/* <Line percent="10" strokeWidth="4" strokeColor="#D3D3D3" /> */}
     
        <Tree
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
          onRightClick={this.onEdit}
          onCheck={this.onCheck}
          multiple={this.state.isMultiSelect}
          treeData={[this.state.treeData]}
          onDoubleClick={this.onDoubleClick}
          ref={this.setTreeRef}
          height={500}
          itemHeight={20}
          style={{ border: '2px solid #0001', width:'600px', height: '500px'}}
        />
     
        <div>
       </div>
       
        </div>
        </Row>
        <Row >
          Event Fired: {this.state.eventType}
        </Row>
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
