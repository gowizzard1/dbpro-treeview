package main

// TreeNode represents one node in a tree view.
type TreeNode struct {
	Name   string
	Label  *Label
	Childs []*TreeNode
}

//Label is the label
type Label struct {
	Label struct {
		En string `json:"en"`
	} `json:"label"`
}

type Tree interface{}

// NewTreeNode returns a new tree node.
func NewTreeNode(name string) *TreeNode {
	return &TreeNode{
		Name: name,
	}
}

// GetChildren returns this node's children.
func (n *TreeNode) GetChildren() []*TreeNode {
	return n.Childs
}

// AddChild adds a new child node to this node and returns a tree node
func (n *TreeNode) AddChild(node *TreeNode) *TreeNode {
	n.Childs = append(n.Childs, node)
	return n
}

// SetName sets the node's text which is displayed.
func (n *TreeNode) SetName(name string) *TreeNode {
	n.Name = name
	return n
}

// AddToTree adds a node to a Node and return a slice of tree node addresses
func AddToTree(root []*TreeNode) []*TreeNode {
	var names = []string{"new node"}
	if len(names) > 0 {
		var i int
		for i = 0; i < len(root); i++ {
			if root[i].Name == names[0] { //already in tree
				break
			}
		}
		if i == len(root) {
			root = append(root, &TreeNode{Name: names[0]})
		}
		root[i].Childs = AddToTree(root[i].Childs)
	}
	return root
}

func OrderByKey() {
	panic("not implemented")
}
