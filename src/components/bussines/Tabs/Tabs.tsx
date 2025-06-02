import React from "react";
import { NavLink } from "react-router-dom";
import { FaThumbtack, FaQuestionCircle } from "react-icons/fa";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";

import type { TabItem } from "../../../types";
import {
  getInitialTabsStateFromStorage,
  saveTabsStateToStorage,
} from "../../../utils/tabsStorage";
import { reorder } from "../../../utils/dndTabs";

import styles from "./Tabs.module.scss";

const Tabs: React.FC = () => {
  const [currentTabs, setCurrentTabs] = React.useState<TabItem[]>(
    getInitialTabsStateFromStorage
  );

  React.useEffect(() => {
    saveTabsStateToStorage(currentTabs);
  }, [currentTabs]);

  const handleTogglePin = (tabId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setCurrentTabs((prevTabs) =>
      prevTabs.map((singleTab) =>
        singleTab.id === tabId
          ? { ...singleTab, pinned: !singleTab.pinned }
          : singleTab
      )
    );
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }
    if (result.destination.index === result.source.index) {
      return;
    }

    const reorderedTabs = reorder(
      currentTabs,
      result.source.index,
      result.destination.index
    );

    setCurrentTabs(reorderedTabs);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="tabsDroppableArea" direction="horizontal">
        {(providedDroppable) => (
          <div
            className={styles.tabs} // Ваш основний контейнер для табів
            {...providedDroppable.droppableProps}
            ref={providedDroppable.innerRef}
          >
            {currentTabs.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(providedDraggable, snapshot) => (
                    <div
                      ref={providedDraggable.innerRef}
                      {...providedDraggable.draggableProps}
                      {...providedDraggable.dragHandleProps}
                      style={{
                        ...providedDraggable.draggableProps.style,
                      }}
                      className={`${styles.tabDraggableWrapper} ${
                        snapshot.isDragging ? styles.isDraggingTab : ""
                      }`}
                    >
                      <NavLink
                        to={item.to}
                        className={({ isActive }) =>
                          `${styles.tabs__item} ${
                            isActive ? styles["tabs__item--active"] : ""
                          } ${item.pinned ? styles["tabs__item--pinned"] : ""}`
                        }
                      >
                        {typeof IconComponent === "function" ? (
                          <IconComponent />
                        ) : (
                          <FaQuestionCircle title="Icon not found" />
                        )}
                        <span className={styles.tabs__title}>{item.title}</span>
                        <button
                          type="button"
                          onClick={(e) => handleTogglePin(item.id, e)}
                          className={`${styles.pinButton} ${
                            item.pinned ? styles["pinButton--active"] : ""
                          }`}
                          aria-label={
                            item.pinned
                              ? `Unpin tab ${item.title}`
                              : `Pin tab ${item.title}`
                          }
                          title={
                            item.pinned
                              ? `Unpin tab ${item.title}`
                              : `Pin tab ${item.title}`
                          }
                        >
                          <FaThumbtack />
                        </button>
                      </NavLink>
                    </div>
                  )}
                </Draggable>
              );
            })}
            {providedDroppable.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default Tabs;
