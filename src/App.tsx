import { useState } from "react";
import { Container, Box, Button, TextField, Link } from "@mui/material";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Tree } from "@minoru/react-dnd-treeview";
import type { NodeModel } from "@minoru/react-dnd-treeview";

// Define the shape of a tree node
interface NavItem {
  id: number;
  parent: number | null;
  text: string;
  path?: string;
  droppable?: boolean;
}

// Initial set of nodes
const initialData: NodeModel<NavItem>[] = [
  { id: 1, parent: 0, text: "Home", path: "#", droppable: true },
  { id: 2, parent: 0, text: "Services", path: "#", droppable: true },
  { id: 3, parent: 2, text: "Web Dev", path: "#", droppable: true },
  { id: 4, parent: 2, text: "Mobile Dev", path: "#", droppable: true },
  { id: 5, parent: 0, text: "About", path: "#", droppable: true },
  { id: 6, parent: 5, text: "Team", path: "#", droppable: true },
];

function App() {
  // State to track all tree nodes
  const [treeData, setTreeData] = useState(initialData);

  // Null means no node is selected, which allows adding to root
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selectedNode = treeData.find((n) => n.id === selectedId);

  // State for editing selected node
  const [editText, setEditText] = useState("");
  const [editPath, setEditPath] = useState("#");

  // State for adding new node
  const [childText, setChildText] = useState("");
  const [childPath, setChildPath] = useState("#");

  // Save edits made to the selected node
  const handleSave = () => {
    if (!selectedNode) return;
    const updated = treeData.map((n) =>
      n.id === selectedNode.id ? { ...n, text: editText, path: editPath } : n
    );
    setTreeData(updated);
  };

  // Add a new node — either child or top-level depending on selection
  const handleAddChild = () => {
    const newItem: NodeModel<NavItem> = {
      id: Date.now(),
      parent: selectedNode?.id ?? 0, // root if no selection
      text: childText,
      path: childPath || "#",
      droppable: true,
    };
    setTreeData((prev) => [...prev, newItem]);
    setChildText("");
    setChildPath("#");
  };


  return (
    <Container maxWidth="lg">
      <Button onClick={()=>{
        setSelectedId(null)
      }}>Add new Item</Button>
      <Box display="flex" gap={4}>
        {/* Tree Pane */}
        <Box className="tree-scope" flex={1}>
          {/* Scoped CSS for tree structure and lines */}
          <style>{`
            .tree-scope ul, .tree-scope li {
              list-style: none !important;
              margin: 0;
              padding: 0;
            }
            .tree-scope .tree-item {
              position: relative;
              display: flex;
              flex-direction: column;
              background: #fdfdfd;
              border: 1px solid #ccc;
              border-radius: 4px;
              margin-bottom: 8px;
              padding: 8px 12px;
              margin-left: 20px;
              transition: background 0.2s ease;
              cursor: pointer;
            }
            .tree-scope .tree-item:hover {
              background: #f0f0f0;
            }
            .tree-scope .tree-item::before {
              content: '';
              position: absolute;
              top: -8px;
              left: -20px;
              width: 20px;
              height: 1px;
              background: #ccc;
            }
            .tree-scope .tree-item::after {
              content: '';
              position: absolute;
              top: -8px;
              left: -20px;
              width: 1px;
              height: 100%;
              background: #ccc;
            }
            .tree-scope .depth-0::before,
            .tree-scope .depth-0::after {
              content: none;
            }
            .tree-scope .chevron {
              width: 0;
              height: 0;
              margin-right: 8px;
              border-left: 5px solid transparent;
              border-right: 5px solid transparent;
              border-top: 6px solid #888;
              transition: transform 0.2s ease;
            }
            .tree-scope .chevron.open {
              transform: rotate(180deg);
            }
          `}</style>

          <h3>Tree</h3>

          {/* DnD-enabled tree viewer */}
          <DndProvider backend={HTML5Backend}>
            <Tree
              tree={treeData}
              rootId={0}
              initialOpen
              render={(node, { depth, isOpen, onToggle }) => (
                <div
                  className={`tree-item depth-${depth}`}
                  style={{ marginLeft: depth * 20 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggle();
                    setSelectedId(node.id);
                    setEditText(node.text);
                    setEditPath(node.path || "#");
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    {node.droppable && (
                      <div className={`chevron ${isOpen ? "open" : ""}`} />
                    )}
                    <span>{node.text}</span>
                  </div>
                  <Link
                    href={node.path || "#"}
                    underline="hover"
                    color="primary"
                    fontSize="0.875rem"
                    sx={{ ml: 2, mt: 0.5 }}
                    onClick={(e) => e.preventDefault()}
                  >
                    {node.path || "#"}
                  </Link>
                </div>
              )}
              dragPreviewRender={(monitorProps) => (
                <div>{monitorProps.item.text}</div>
              )}
              onDrop={(newTree) => setTreeData(newTree)}
            />
          </DndProvider>
        </Box>

        {/* Details/Edit/Add Pane */}
        <Box flex={1}>
          <h3>{
            selectedNode
              ? `Editing: "${selectedNode.text}"`
              : "Create New Top-Level Item"
          }</h3>

          {/* Show edit fields only if a node is selected */}
          {selectedNode && (
            <>
              <TextField
                label="Name"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                fullWidth
                size="small"
                sx={{ mb: 2 }}
              />
              <TextField
                label="Path"
                value={editPath}
                onChange={(e) => setEditPath(e.target.value)}
                fullWidth
                size="small"
                sx={{ mb: 2 }}
              />
              <Button variant="contained" onClick={handleSave} sx={{ mb: 3 }}>
                Save Changes
              </Button>
            </>
          )}

          <h4>{selectedNode ? "Add Child" : "Add Top-Level Item"}</h4>
          <TextField
            label="Name"
            value={childText}
            onChange={(e) => setChildText(e.target.value)}
            fullWidth
            size="small"
            sx={{ mb: 2 }}
          />
          <TextField
            label="Path"
            value={childPath}
            onChange={(e) => setChildPath(e.target.value)}
            fullWidth
            size="small"
            sx={{ mb: 2 }}
          />
          <Button variant="outlined" onClick={handleAddChild}>
            {selectedNode ? "Add Child" : "Add Top-Level Item"}
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

export default App;