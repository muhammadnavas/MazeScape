// AStar pathfinding algorithm implementation
class AStar {
    constructor() {
        this.openSet = [];
        this.closedSet = new Set();
        this.gScore = new Map();
        this.fScore = new Map();
        this.cameFrom = new Map();
    }

    findPath(maze, start, goal) {
        this.reset();
        
        const startKey = this.nodeKey(start);
        const goalKey = this.nodeKey(goal);
        
        this.openSet.push(start);
        this.gScore.set(startKey, 0);
        this.fScore.set(startKey, this.heuristic(start, goal));
        
        while (this.openSet.length > 0) {
            // Find node with lowest fScore
            let current = this.openSet.reduce((lowest, node) => {
                const currentF = this.fScore.get(this.nodeKey(node)) || Infinity;
                const lowestF = this.fScore.get(this.nodeKey(lowest)) || Infinity;
                return currentF < lowestF ? node : lowest;
            });
            
            const currentKey = this.nodeKey(current);
            
            if (currentKey === goalKey) {
                return this.reconstructPath(current);
            }
            
            // Remove current from openSet
            this.openSet = this.openSet.filter(node => this.nodeKey(node) !== currentKey);
            this.closedSet.add(currentKey);
            
            // Check neighbors
            const neighbors = this.getNeighbors(current, maze);
            for (let neighbor of neighbors) {
                const neighborKey = this.nodeKey(neighbor);
                
                if (this.closedSet.has(neighborKey)) {
                    continue;
                }
                
                const tentativeGScore = (this.gScore.get(currentKey) || 0) + 1;
                
                if (!this.openSet.some(node => this.nodeKey(node) === neighborKey)) {
                    this.openSet.push(neighbor);
                } else if (tentativeGScore >= (this.gScore.get(neighborKey) || Infinity)) {
                    continue;
                }
                
                this.cameFrom.set(neighborKey, current);
                this.gScore.set(neighborKey, tentativeGScore);
                this.fScore.set(neighborKey, tentativeGScore + this.heuristic(neighbor, goal));
            }
        }
        
        return []; // No path found
    }
    
    reset() {
        this.openSet = [];
        this.closedSet.clear();
        this.gScore.clear();
        this.fScore.clear();
        this.cameFrom.clear();
    }
    
    nodeKey(node) {
        return `${node[0]},${node[1]}`;
    }
    
    heuristic(a, b) {
        return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
    }
    
    getNeighbors(node, maze) {
        const neighbors = [];
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        
        for (let [dy, dx] of directions) {
            const newY = node[0] + dy;
            const newX = node[1] + dx;
            
            if (newY >= 0 && newY < maze.length && 
                newX >= 0 && newX < maze[0].length && 
                maze[newY][newX] === 0) {
                neighbors.push([newY, newX]);
            }
        }
        
        return neighbors;
    }
    
    reconstructPath(current) {
        const path = [current];
        const currentKey = this.nodeKey(current);
        
        let node = this.cameFrom.get(currentKey);
        while (node) {
            path.unshift(node);
            node = this.cameFrom.get(this.nodeKey(node));
        }
        
        return path;
    }
}
