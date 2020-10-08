import React, { Component } from 'react';
import styled from 'styled-components';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Input, Card, Typography, Row, Col } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';



const { Title, Text } = Typography;
const { Search } = Input;

const initialData = [
    {
        id: '1212',
        note: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",

    },
    {
        id: '1213',
        note: "Lorem Ipsum is simply dummy text of the printing and typesetting industry."

    },
    {
        id: '1214',
        note: "Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages."
    },

];

// a little function to help us with reordering the result
const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
};

/**
 * Moves an item from one list to another list.
 */
const move = (source, destination, droppableSource, droppableDestination) => {
    const sourceClone = Array.from(source);
    const destClone = Array.from(destination);
    const [removed] = sourceClone.splice(droppableSource.index, 1);

    destClone.splice(droppableDestination.index, 0, removed);

    const result = {};
    result[droppableSource.droppableId] = sourceClone;
    result[droppableDestination.droppableId] = destClone;

    return result;
};

const grid = 8;

const getItemStyle = (isDragging, draggableStyle) => ({
    // some basic styles to make the items look a bit nicer
    userSelect: 'none',
    padding: grid * 2,
    margin: `0 0 ${grid}px 0`,

    // change background colour if dragging
    background: isDragging ? 'transparent' : 'transparent',

    // styles we need to apply on draggables
    ...draggableStyle
});

const getListStyle = isDraggingOver => ({
    background: isDraggingOver ? 'rgb(220 242 255)' : '#eee',
    padding: grid,
    width: 500,
    marginTop: 40,
    marginRight: 20,
    borderRadius: 5,
});

class Note extends Component {

    constructor(props) {
        super(props)
        this.state = {
            note: '',
            list: [],
            items: initialData,
            selected: [],
        }
        this.sendMessage = this.sendMessage.bind(this);
        this.onChange = this.onChange.bind(this);
    }

    sendMessage(note) {
        if (!note) {
            return;
        }
        const newData = {
            id: `${Math.random()}`,
            note: note,
            edited: false
        }
        const data = [newData, ...this.state.items];

        this.setState({
            items: data,
            note: '',
        })

    }

    onChange(e) {
        this.setState({ note: e.target.value });

    }

    deleteItem(key) {
        const data = [...this.state.items];
        // Filter values and leave value which we need to delete 
        const updateList = data.filter(item => item.id !== key);
        if (updateList.length === this.state.items.length) {
            const completedData = [...this.state.selected];
            const updated = completedData.filter(item => item.id !== key);
            this.setState({
                selected: updated,
            });
        } else {
            this.setState({
                items: updateList,
            });
        }

    }

    /**
     * A semi-generic way to handle multiple lists. Matches
     * the IDs of the droppable container to the names of the
     * source arrays stored in the state.
     */
    id2List = {
        droppable: 'items',
        droppable2: 'selected'
    };

    getList = id => this.state[this.id2List[id]];

    onDragEnd = result => {
        const { source, destination } = result;

        // dropped outside the list
        if (!destination) {
            return;
        }

        if (source.droppableId === destination.droppableId) {
            const items = reorder(
                this.getList(source.droppableId),
                source.index,
                destination.index
            );

            let state = { items };

            if (source.droppableId === 'droppable2') {
                state = { selected: items };
            }

            this.setState(state);
        } else {
            const result = move(
                this.getList(source.droppableId),
                this.getList(destination.droppableId),
                source,
                destination
            );

            this.setState({
                items: result.droppable,
                selected: result.droppable2
            });
        }
    };

    render() {
        const { data } = this.state;

        return (
            <Wrapper>
                <Row>
                    <Col xs={{ span: 24 }} md={{ span: 18, offset: 1 }} lg={{ span: 16, offset: 2 }} xl={{ span: 14, offset: 3 }} xxl={{ span: 16, offset: 4 }}>

                        <Title style={{ textAlign: "center", marginTop: 30, fontFamily: "ui-rounded", fontWeight: "bold" }}>Note Manager</Title>
                        <div>
                            <Search style={{ marginTop: 30, color: "rgb(123 37 66)" }}
                                placeholder="Add Note"
                                enterButton="Add"
                                size="large"
                                onSearch={this.sendMessage}
                                onChange={this.onChange}
                                value={this.state.note}
                            />
                        </div>

                        <DragDrtopStyle>
                            <DragDropContext onDragEnd={this.onDragEnd}>
                                <Droppable droppableId="droppable">
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            style={getListStyle(snapshot.isDraggingOver)}>

                                            {this.state.items.map((item, index) => (
                                                <Draggable
                                                    key={item.id}
                                                    draggableId={item.id}
                                                    index={index}>
                                                    {(provided, snapshot) => (


                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            style={getItemStyle(
                                                                snapshot.isDragging,
                                                                provided.draggableProps.style
                                                            )}>

                                                            <Card key={item.id} style={{ backgroundColor: "#ffc" }} className="cardBody">
                                                                {/* {item.content} */}
                                                                <Text style={{ fontSize: 15, display: "flex", justifyContent: "flex-start", }}>{item.note}</Text>
                                                                <DeleteOutlined onClick={() => this.deleteItem(item.id)} style={{ display: "flex", justifyContent: "flex-start", marginTop: 30 }} />
                                                            </Card>
                                                        </div>
                                                    )}

                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>

                                <Droppable droppableId="droppable2" >
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            style={getListStyle(snapshot.isDraggingOver)}>
                                            {this.state.selected.map((item, index) => (

                                                <Draggable
                                                    key={item.id}
                                                    draggableId={item.id}
                                                    index={index}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            style={getItemStyle(
                                                                snapshot.isDragging,
                                                                provided.draggableProps.style
                                                            )}>
                                                            <Card key={item.id} style={{ backgroundColor: "rgb(123 37 66)" }} className="cardBody">
                                                                <Text style={{ fontSize: 15, display: "flex", justifyContent: "flex-start", color: "#fff" }}>{item.note}</Text>
                                                                <DeleteOutlined onClick={() => this.deleteItem(item.id)} style={{ display: "flex", justifyContent: "flex-start", marginTop: 30 }} />
                                                            </Card>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>

                            </DragDropContext>
                        </DragDrtopStyle>
                    </Col>
                </Row>
            </Wrapper>
        );
    }
}

export default Note


const Wrapper = styled.div`
    padding: 20px;
    background: #fff;
    width: 100%;
    display: flex;
    flex-direction: column;    
    height:"100vh";

    .ant-btn-primary {
    color: #fff;
    background: #7b2543;
    border-color: #1890ff;
    text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.12);
    -webkit-box-shadow: 0 2px 0 rgba(0, 0, 0, 0.045);
    box-shadow: 0 2px 0 rgba(0, 0, 0, 0.045);
}
`;

const DragDrtopStyle = styled.div`
    display: flex;
    justify-content: center;

    .anticon svg {
    display: inline-block;
    font-size: 20px;
    color: #ec0000;
}

.ant-card-body {
    padding: 24px;
    -moz-box-shadow: 5px 5px 7px rgba(33,33,33,1);
    -webkit-box-shadow: 5px 5px 7px rgba(33,33,33,.7);
    box-shadow: 5px 5px 7px rgba(33,33,33,.7);
   
}


`;


