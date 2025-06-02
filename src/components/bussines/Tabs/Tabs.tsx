import React, { useState, useEffect, useCallback } from "react";
import { NavLink } from "react-router-dom";
import { FaThumbtack, FaEllipsisH, FaQuestionCircle } from "react-icons/fa";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import useMeasure from "react-use-measure";

import type { TabItem } from "../../../types";
import {
  getInitialTabsStateFromStorage,
  saveTabsStateToStorage,
} from "../../../utils/tabsStorage";
import { reorder } from "../../../utils/dndTabs";

import styles from "./Tabs.module.scss";

const MORE_BUTTON_WIDTH_ESTIMATE = 65;

const Tabs: React.FC = () => {
  const [currentTabs, setCurrentTabs] = useState<TabItem[]>(
    getInitialTabsStateFromStorage
  );
  const [visibleCount, setVisibleCount] = useState<number>(currentTabs.length);
  const [isOverflowMenuOpen, setIsOverflowMenuOpen] = useState(false);

  const [tabsContainerRef, { width: containerWidth }] = useMeasure();
  const [moreButtonRef, { width: moreButtonActualWidth }] = useMeasure();

  const tabIndividualWidths = React.useRef<Record<string, number>>({});
  const tabDomRefs = React.useRef<Map<string, HTMLDivElement | null>>(
    new Map()
  );

  const registerTabDomRef = useCallback(
    (id: string, node: HTMLDivElement | null) => {
      if (node) {
        tabDomRefs.current.set(id, node);
      } else {
        tabDomRefs.current.delete(id);
      }
    },
    []
  );

  useEffect(() => {
    let widthsChanged = false;
    const newWidths: Record<string, number> = {};
    currentTabs.forEach((tab) => {
      const node = tabDomRefs.current.get(tab.id);
      if (node && node.offsetWidth > 0) {
        newWidths[tab.id] = node.offsetWidth;
        if (tabIndividualWidths.current[tab.id] !== node.offsetWidth) {
          widthsChanged = true;
        }
      }
    });
    if (
      widthsChanged ||
      (Object.keys(newWidths).length !==
        Object.keys(tabIndividualWidths.current).length &&
        Object.keys(newWidths).length > 0)
    ) {
      tabIndividualWidths.current = {
        ...tabIndividualWidths.current,
        ...newWidths,
      };
      setCurrentTabs((prev) => [...prev]);
    }
  }, [currentTabs]);

  useEffect(() => {
    saveTabsStateToStorage(currentTabs);
  }, [currentTabs]);

  const tabIndividualWidthsString = JSON.stringify(tabIndividualWidths.current);

  useEffect(() => {
    if (containerWidth === 0 && currentTabs.length > 0) {
      setVisibleCount(0);
      return;
    }
    if (currentTabs.length === 0) {
      setVisibleCount(0);
      return;
    }

    const allTabsHaveMeasuredWidth = currentTabs.every(
      (tab) =>
        tabIndividualWidths.current[tab.id] &&
        tabIndividualWidths.current[tab.id] > 0
    );

    if (!allTabsHaveMeasuredWidth && currentTabs.length > 0) {
      setVisibleCount(currentTabs.length);
      return;
    }

    let accumulatedWidth = 0;
    let count = 0;
    const finalMoreButtonWidth =
      moreButtonActualWidth > 0
        ? moreButtonActualWidth
        : MORE_BUTTON_WIDTH_ESTIMATE;

    for (let i = 0; i < currentTabs.length; i++) {
      const tab = currentTabs[i];
      const currentTabActualWidth = tabIndividualWidths.current[tab.id] || 100;

      const hasMoreTabsAfterThis = i < currentTabs.length - 1;
      const spaceForMoreButton = hasMoreTabsAfterThis
        ? finalMoreButtonWidth
        : 0;

      if (
        accumulatedWidth + currentTabActualWidth + spaceForMoreButton <=
        containerWidth
      ) {
        accumulatedWidth += currentTabActualWidth;
        count++;
      } else {
        if (
          !hasMoreTabsAfterThis &&
          accumulatedWidth + currentTabActualWidth <= containerWidth
        ) {
          accumulatedWidth += currentTabActualWidth;
          count++;
        } else {
          break;
        }
      }
    }
    setVisibleCount(count);
  }, [
    containerWidth,
    currentTabs,
    moreButtonActualWidth,
    tabIndividualWidthsString,
  ]);

  const handleTogglePin = (
    tabId: string,
    e: React.MouseEvent,
    isFromOverflow = false
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentTabs((prevTabs) =>
      prevTabs.map((singleTab) =>
        singleTab.id === tabId
          ? { ...singleTab, pinned: !singleTab.pinned }
          : singleTab
      )
    );
    if (isFromOverflow) setIsOverflowMenuOpen(false);
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination || result.destination.index === result.source.index)
      return;
    const reordered = reorder(
      currentTabs,
      result.source.index,
      result.destination.index
    );
    setCurrentTabs(reordered);
  };

  const overflowRenderTabs = currentTabs.slice(visibleCount);

  return (
    <div className={styles.tabsLayoutWrapper}>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="tabsDroppableArea" direction="horizontal">
          {(providedDroppable) => (
            <div
              className={styles.tabs}
              ref={(node) => {
                providedDroppable.innerRef(node);
                tabsContainerRef(node);
              }}
              {...providedDroppable.droppableProps}
            >
              {currentTabs.map((item, index) => {
                const IconComponent = item.icon;
                const isVisible = index < visibleCount;
                return (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(providedDraggable, snapshot) => (
                      <div
                        ref={(node) => {
                          providedDraggable.innerRef(node);
                          registerTabDomRef(item.id, node);
                        }}
                        {...providedDraggable.draggableProps}
                        {...providedDraggable.dragHandleProps}
                        style={{
                          ...providedDraggable.draggableProps.style,
                          display: isVisible ? undefined : "none",
                        }}
                        className={`${styles.tabs__draggableWrapper} ${
                          snapshot.isDragging
                            ? styles["tabs__draggableWrapper--dragging"]
                            : ""
                        }`}
                      >
                        <NavLink
                          to={item.to}
                          className={({ isActive }) =>
                            `${styles.tabs__item} ${
                              isActive ? styles["tabs__item--active"] : ""
                            } ${
                              item.pinned ? styles["tabs__item--pinned"] : ""
                            }`
                          }
                          tabIndex={isVisible ? 0 : -1}
                          aria-hidden={!isVisible}
                        >
                          {typeof IconComponent === "function" ? (
                            <IconComponent className={styles.tabs__itemIcon} />
                          ) : (
                            <FaQuestionCircle
                              className={styles.tabs__itemIcon}
                              title="Icon not found"
                            />
                          )}
                          <span className={styles.tabs__title}>
                            {item.title}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleTogglePin(item.id, e)}
                            className={`${styles.tabs__pinButton} ${
                              item.pinned
                                ? styles["tabs__pinButton--active"]
                                : ""
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
                            tabIndex={isVisible ? 0 : -1}
                          >
                            <FaThumbtack
                              className={styles.tabs__pinButtonIcon}
                            />
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
      {overflowRenderTabs.length > 0 && (
        <div className={styles.tabs__moreButtonContainer}>
          <button
            type="button"
            ref={moreButtonRef}
            className={styles.tabs__moreButton}
            onClick={() => setIsOverflowMenuOpen(!isOverflowMenuOpen)}
            aria-expanded={isOverflowMenuOpen}
            aria-haspopup="menu"
            aria-controls="overflow-menu-list"
          >
            <FaEllipsisH className={styles.tabs__moreButtonIcon} />{" "}
            <span className={styles.tabs__moreButtonCount}>
              ({overflowRenderTabs.length})
            </span>
          </button>
          {isOverflowMenuOpen && (
            <div
              className={styles.tabs__overflowMenu}
              role="menu"
              id="overflow-menu-list"
            >
              {overflowRenderTabs.map((item) => {
                const IconComponent = item.icon;
                return (
                  <NavLink
                    key={`overflow-${item.id}`}
                    to={item.to}
                    role="menuitem"
                    className={({ isActive }) =>
                      `${styles.tabs__overflowMenuItem} ${
                        isActive ? styles["tabs__overflowMenuItem--active"] : ""
                      }`
                    }
                    onClick={() => setIsOverflowMenuOpen(false)}
                  >
                    {typeof IconComponent === "function" ? (
                      <IconComponent
                        className={styles.tabs__overflowMenuIcon}
                      />
                    ) : (
                      <FaQuestionCircle
                        className={styles.tabs__overflowMenuIcon}
                      />
                    )}
                    <span className={styles.tabs__overflowMenuTitle}>
                      {item.title}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleTogglePin(item.id, e, true)}
                      className={`${styles.tabs__pinButton} ${
                        styles["tabs__pinButton--overflow"]
                      } ${
                        item.pinned ? styles["tabs__pinButton--active"] : ""
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
                      <FaThumbtack className={styles.tabs__pinButtonIcon} />{" "}
                    </button>
                  </NavLink>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Tabs;
