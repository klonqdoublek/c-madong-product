"use client";

import { useTranslations } from "next-intl";
import { useMenuStore, ALL_MENU_ITEMS, MenuItem } from "@/stores/menu-store";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutGrid, 
  Menu as MenuIcon, 
  GripVertical, 
  Check
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function SortableMenuItem({ 
  item, 
  isEditMode, 
  onClose 
}: { 
  item: MenuItem; 
  isEditMode: boolean;
  onClose: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  const Icon = item.icon;
  const t = useTranslations("dashboard");

  const Content = (
    <div className="flex flex-col items-center gap-1.5 w-full">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
        <Icon className="size-6 text-primary" />
      </div>
      <span className="text-xs font-bold text-cu-grey line-clamp-1">
        {t(item.labelKey)}
      </span>
    </div>
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative flex flex-col items-center gap-2 rounded-lg border border-black/5 bg-[#FFFEF5] p-3 text-center transition-shadow",
        isEditMode ? "cursor-grab active:cursor-grabbing shadow-sm" : "hover:shadow-sm",
        isDragging && "opacity-50"
      )}
      {...(isEditMode ? { ...attributes, ...listeners } : {})}
    >
      {isEditMode ? (
        Content
      ) : (
        <Link
          href={item.href}
          onClick={onClose}
          className="flex flex-col items-center gap-1.5 w-full"
        >
          {Content}
        </Link>
      )}
      {isEditMode && (
        <div className="absolute top-1 right-1">
          <GripVertical className="size-4 text-cu-grey/40" />
        </div>
      )}
    </div>
  );
}

export function MenuModal() {
  const { isMenuModalOpen, setMenuModalOpen, quickMenuOrder, setQuickMenuOrder } = useMenuStore();
  const [isEditMode, setIsEditMode] = useState(false);
  const [draftOrder, setDraftOrder] = useState(quickMenuOrder);
  const activeOrder = isEditMode ? draftOrder : quickMenuOrder;

  useEffect(() => {
    if (isMenuModalOpen) {
      setDraftOrder(quickMenuOrder);
    }
  }, [isMenuModalOpen, quickMenuOrder]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = draftOrder.indexOf(active.id as string);
      const newIndex = draftOrder.indexOf(over.id as string);
      setDraftOrder(arrayMove(draftOrder, oldIndex, newIndex));
    }
  };

  const sortedItems = useMemo(
    () =>
      activeOrder
        .map((id) => ALL_MENU_ITEMS.find((item) => item.id === id))
        .filter(Boolean) as MenuItem[],
    [activeOrder]
  );

  const dormItems = sortedItems.filter((item) => item.category === "dormitory");
  const accountItems = sortedItems.filter((item) => item.category === "account");
  const settingsItems = sortedItems.filter((item) => item.category === "settings");

  const handleClose = () => {
    setIsEditMode(false);
    setDraftOrder(quickMenuOrder);
    setMenuModalOpen(false);
  };

  const handleDone = () => {
    setQuickMenuOrder(draftOrder);
    setIsEditMode(false);
  };

  return (
    <AnimatePresence>
      {isMenuModalOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !isEditMode && handleClose()}
            className="fixed inset-x-0 top-0 bottom-20 z-[55] bg-black/40 md:hidden"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            drag={isEditMode ? false : "y"}
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100) handleClose();
            }}
            className="fixed inset-x-0 bottom-20 z-[60] flex h-[75dvh] flex-col rounded-t-[26px] bg-[#FFFEF5] shadow-[0_-8px_30px_rgb(0,0,0,0.12)] md:hidden"
          >
            {/* Drag Handle */}
            <div className="flex w-full justify-center py-3">
              <div className="h-1.5 w-16 rounded-full bg-black/10" />
            </div>

            {/* Header Area */}
            <div className="px-4 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <LayoutGrid className="size-5 text-primary" />
                  </div>
                  <h2 className="text-[17px] font-bold text-[#3F3F3D] tracking-tight">เมนูทั้งหมด</h2>
                </div>
                
                <div className="flex items-center gap-2">
                  {isEditMode ? (
                    <button 
                      type="button"
                      onClick={handleDone}
                      className="flex h-9 items-center gap-1.5 rounded-full bg-primary px-5 text-[14px] font-bold text-white transition-all active:scale-95 shadow-md shadow-primary/20"
                    >
                      <Check className="size-4" />
                      เสร็จสิ้น
                    </button>
                  ) : (
                    <button 
                      type="button"
                      onClick={() => setIsEditMode(true)}
                      className="flex h-9 items-center gap-1.5 rounded-full bg-white border border-black/5 px-4 text-[13px] font-bold text-cu-grey transition-all active:scale-95 shadow-sm"
                    >
                      <MenuIcon className="size-3.5" />
                      จัดเรียงใหม่
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto px-4 pt-2">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                {/* Section: หอพัก */}
                <div className="mb-8">
                  <h3 className="mb-4 text-[15px] font-bold text-[#3F3F3D]/60 tracking-tight">หอพัก</h3>
                  <div className="grid grid-cols-4 gap-x-3 gap-y-4">
                    <SortableContext items={dormItems.map(i => i.id)} strategy={rectSortingStrategy}>
                      {dormItems.map((item) => (
                        <SortableMenuItem 
                          key={item.id} 
                          item={item} 
                          isEditMode={isEditMode} 
                          onClose={handleClose}
                        />
                      ))}
                    </SortableContext>
                  </div>
                </div>

                {/* Section: บัญชี */}
                <div className="mb-8">
                  <h3 className="mb-4 text-[15px] font-bold text-[#3F3F3D]/60 tracking-tight">บัญชี</h3>
                  <div className="grid grid-cols-4 gap-x-3 gap-y-4">
                    <SortableContext items={accountItems.map(i => i.id)} strategy={rectSortingStrategy}>
                      {accountItems.map((item) => (
                        <SortableMenuItem 
                          key={item.id} 
                          item={item} 
                          isEditMode={isEditMode} 
                          onClose={handleClose}
                        />
                      ))}
                    </SortableContext>
                  </div>
                </div>

                {/* Section: การตั้งค่า */}
                <div className="mb-8">
                  <h3 className="mb-4 text-[15px] font-bold text-[#3F3F3D]/60 tracking-tight">การตั้งค่า</h3>
                  <div className="grid grid-cols-4 gap-x-3 gap-y-4">
                    <SortableContext items={settingsItems.map(i => i.id)} strategy={rectSortingStrategy}>
                      {settingsItems.map((item) => (
                        <SortableMenuItem 
                          key={item.id} 
                          item={item} 
                          isEditMode={isEditMode} 
                          onClose={handleClose}
                        />
                      ))}
                    </SortableContext>
                  </div>
                </div>
              </DndContext>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
