"use client";

import { useState, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useKnowledgeStore } from "@/stores/knowledge-store";
import {
  useFolderTree,
  useDocumentTags,
  useKnowledgeDocuments,
  useCreateFolder,
  useUpdateFolder,
  useDeleteFolder,
  useCreateTag,
  useDeleteTag,
  useUploadKnowledgeDocument,
  useDeleteDocument,
  useUpdateDocument,
  useBulkDocumentAction,
} from "@/hooks/use-knowledge";
import { useKnowledgeQuery } from "@/hooks/use-knowledge-query";
import type { FolderTreeNode, KnowledgeDocument } from "@/hooks/use-knowledge";
import { KnowledgeSidebar } from "./knowledge-sidebar";
import { FolderView } from "./folder-view";
import { FileDetailView } from "./file-detail-view";
import { CreateFolderDialog } from "./create-folder-dialog";
import { UploadDocumentDialog } from "./upload-document-dialog";
import { MoveDocumentsDialog } from "./move-documents-dialog";
import { TagManagementDialog } from "./tag-management-dialog";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";

export function KnowledgePageContent() {
  const t = useTranslations("admin.knowledgeBase");
  const store = useKnowledgeStore();

  // Data
  const { data: folderTree, flatFolders, isLoading: foldersLoading } = useFolderTree();
  const { data: tags } = useDocumentTags();
  const { data: documents, isLoading: docsLoading } = useKnowledgeDocuments({
    folderId: store.selectedFolderId,
    tagId: store.filterTagId,
    search: store.searchQuery || undefined,
    status: store.filterStatus !== "all" ? store.filterStatus : undefined,
    sortBy: store.sortBy,
    sortOrder: store.sortOrder,
  });
  // All documents (no folder filter) for sidebar file list + counts
  const { data: allDocuments } = useKnowledgeDocuments({
    search: store.searchQuery || undefined,
  });

  // Document counts per folder
  const documentCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const doc of allDocuments ?? []) {
      if (doc.folder_id) {
        counts[doc.folder_id] = (counts[doc.folder_id] ?? 0) + 1;
      }
    }
    return counts;
  }, [allDocuments]);

  // Mutations
  const createFolder = useCreateFolder();
  const updateFolder = useUpdateFolder();
  const deleteFolder = useDeleteFolder();
  const createTag = useCreateTag();
  const deleteTag = useDeleteTag();
  const uploadDoc = useUploadKnowledgeDocument();
  const deleteDoc = useDeleteDocument();
  const updateDoc = useUpdateDocument();
  const bulkAction = useBulkDocumentAction();

  // Dialog state
  const [folderDialog, setFolderDialog] = useState<{
    open: boolean;
    parentId?: string;
    editFolder?: FolderTreeNode | null;
  }>({ open: false });
  const [uploadDialog, setUploadDialog] = useState(false);
  const [moveDialog, setMoveDialog] = useState(false);
  const [tagDialog, setTagDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({ open: false, title: "", description: "", onConfirm: () => {} });

  // Single file move/edit state
  const [moveDocIds, setMoveDocIds] = useState<string[]>([]);

  // Playground state
  const queryKnowledge = useKnowledgeQuery();
  const [question, setQuestion] = useState("");

  // Handlers
  const handleCreateFolder = useCallback(
    (parentId?: string) => {
      setFolderDialog({ open: true, parentId, editFolder: null });
    },
    []
  );

  const handleRenameFolder = useCallback(
    (folder: FolderTreeNode) => {
      setFolderDialog({ open: true, editFolder: folder });
    },
    []
  );

  const handleDeleteFolder = useCallback(
    (folder: FolderTreeNode) => {
      setDeleteDialog({
        open: true,
        title: t("folder.delete"),
        description: t("folder.deleteConfirm"),
        onConfirm: () => {
          deleteFolder.mutate(folder.id, {
            onSuccess: () => {
              toast.success(t("toast.folderDeleted"));
              setDeleteDialog((d) => ({ ...d, open: false }));
              if (store.selectedFolderId === folder.id) {
                store.setSelectedFolderId(null);
              }
            },
            onError: () => toast.error(t("toast.error")),
          });
        },
      });
    },
    [deleteFolder, store, t]
  );

  const handleFolderSubmit = useCallback(
    (data: { name: string; parentId?: string | null }) => {
      if (folderDialog.editFolder) {
        updateFolder.mutate(
          { id: folderDialog.editFolder.id, ...data },
          {
            onSuccess: () => {
              toast.success(t("toast.folderRenamed"));
              setFolderDialog({ open: false });
            },
            onError: () => toast.error(t("toast.error")),
          }
        );
      } else {
        createFolder.mutate(data, {
          onSuccess: () => {
            toast.success(t("toast.folderCreated"));
            setFolderDialog({ open: false });
          },
          onError: () => toast.error(t("toast.error")),
        });
      }
    },
    [folderDialog.editFolder, updateFolder, createFolder, t]
  );

  const handleUpload = useCallback(
    (file: File, folderId: string | null, tagIds: string[]) => {
      uploadDoc.mutate(
        { file, folderId, tagIds },
        {
          onSuccess: () => {
            toast.success(t("toast.documentUploaded"));
            setUploadDialog(false);
          },
          onError: () => toast.error(t("toast.error")),
        }
      );
    },
    [uploadDoc, t]
  );

  const handleViewFile = useCallback(
    (id: string) => {
      store.openFile(id);
    },
    [store]
  );

  const handleEditFile = useCallback(
    (_doc: KnowledgeDocument) => {
      // For now, open in detail view
      store.openFile(_doc.id);
    },
    [store]
  );

  const handleMoveFile = useCallback(
    (doc: KnowledgeDocument) => {
      setMoveDocIds([doc.id]);
      setMoveDialog(true);
    },
    []
  );

  const handleDeleteFile = useCallback(
    (doc: KnowledgeDocument) => {
      setDeleteDialog({
        open: true,
        title: t("file.delete"),
        description: t("file.deleteConfirm"),
        onConfirm: () => {
          deleteDoc.mutate(doc.id, {
            onSuccess: () => {
              toast.success(t("toast.documentDeleted"));
              setDeleteDialog((d) => ({ ...d, open: false }));
            },
            onError: () => toast.error(t("toast.error")),
          });
        },
      });
    },
    [deleteDoc, t]
  );

  // Bulk handlers
  const handleBulkMove = useCallback(() => {
    setMoveDocIds(store.selectedFileIds);
    setMoveDialog(true);
  }, [store.selectedFileIds]);

  const handleBulkDelete = useCallback(() => {
    setDeleteDialog({
      open: true,
      title: t("bulk.delete"),
      description: t("bulk.deleteConfirm", { count: store.selectedFileIds.length }),
      onConfirm: () => {
        bulkAction.mutate(
          { action: "delete", documentIds: store.selectedFileIds },
          {
            onSuccess: () => {
              toast.success(t("toast.documentsDeleted"));
              store.clearSelection();
              setDeleteDialog((d) => ({ ...d, open: false }));
            },
            onError: () => toast.error(t("toast.error")),
          }
        );
      },
    });
  }, [bulkAction, store, t]);

  const handleBulkTag = useCallback(() => {
    setTagDialog(true);
  }, []);

  const handleBulkReprocess = useCallback(() => {
    bulkAction.mutate(
      { action: "reprocess", documentIds: store.selectedFileIds },
      {
        onSuccess: () => {
          toast.success(t("reprocess"));
          store.clearSelection();
        },
        onError: () => toast.error(t("toast.error")),
      }
    );
  }, [bulkAction, store, t]);

  const handleMove = useCallback(
    (folderId: string | null) => {
      if (moveDocIds.length === 1) {
        updateDoc.mutate(
          { id: moveDocIds[0], folderId },
          {
            onSuccess: () => {
              toast.success(t("toast.documentsMoved"));
              setMoveDialog(false);
              setMoveDocIds([]);
            },
            onError: () => toast.error(t("toast.error")),
          }
        );
      } else {
        bulkAction.mutate(
          { action: "move", documentIds: moveDocIds, folderId },
          {
            onSuccess: () => {
              toast.success(t("toast.documentsMoved"));
              setMoveDialog(false);
              setMoveDocIds([]);
              store.clearSelection();
            },
            onError: () => toast.error(t("toast.error")),
          }
        );
      }
    },
    [moveDocIds, updateDoc, bulkAction, store, t]
  );

  const handlePlaygroundClick = useCallback(() => {
    store.setView("playground");
  }, [store]);

  return (
    <div className="flex h-dvh flex-col">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <KnowledgeSidebar
          folderTree={folderTree}
          documents={allDocuments ?? []}
          documentCounts={documentCounts}
          onCreateFolder={handleCreateFolder}
          onRenameFolder={handleRenameFolder}
          onDeleteFolder={handleDeleteFolder}
          onUploadClick={() => setUploadDialog(true)}
          onPlaygroundClick={handlePlaygroundClick}
        />

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          {store.view === "folder" && (
            <FolderView
              folders={flatFolders}
              folderTree={folderTree}
              documents={documents ?? []}
              documentCounts={documentCounts}
              tags={tags ?? []}
              isLoading={docsLoading}
              onCreateFolder={handleCreateFolder}
              onRenameFolder={handleRenameFolder}
              onDeleteFolder={handleDeleteFolder}
              onUploadClick={() => setUploadDialog(true)}
              onViewFile={handleViewFile}
              onEditFile={handleEditFile}
              onMoveFile={handleMoveFile}
              onDeleteFile={handleDeleteFile}
              onBulkMove={handleBulkMove}
              onBulkDelete={handleBulkDelete}
              onBulkTag={handleBulkTag}
              onBulkReprocess={handleBulkReprocess}
            />
          )}

          {store.view === "file-detail" && <FileDetailView />}

          {store.view === "playground" && (
            <div className="space-y-4 p-4">
              <p className="text-sm text-muted-foreground">{t("playgroundDescription")}</p>
              <div className="flex gap-2">
                <input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder={t("questionPlaceholder")}
                  onKeyDown={(e) => e.key === "Enter" && question.trim() && queryKnowledge.mutate(question)}
                  className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm"
                />
                <button
                  onClick={() => queryKnowledge.mutate(question)}
                  disabled={queryKnowledge.isPending || !question.trim()}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {queryKnowledge.isPending ? t("thinking") : t("ask")}
                </button>
              </div>

              {queryKnowledge.data && (
                <div className="space-y-3">
                  <div className="rounded-lg border bg-card p-4">
                    <h3 className="mb-2 font-medium">{t("answer")}</h3>
                    <p className="whitespace-pre-wrap text-sm">{queryKnowledge.data.answer}</p>
                  </div>
                  {queryKnowledge.data.sources.length > 0 && (
                    <div className="rounded-lg border bg-muted/30 p-4">
                      <h3 className="mb-2 text-sm font-medium">{t("sources")}</h3>
                      {queryKnowledge.data.sources.map((src, i) => (
                        <div key={i} className="mt-2 border-t pt-2 text-xs text-muted-foreground">
                          <p className="line-clamp-3">{src.content}</p>
                          <p className="mt-1 text-xs opacity-60">
                            {t("similarity")}: {(src.similarity * 100).toFixed(1)}%
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {queryKnowledge.error && (
                <p className="text-sm text-destructive">{t("queryError")}</p>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Dialogs */}
      <CreateFolderDialog
        open={folderDialog.open}
        onOpenChange={(open) => setFolderDialog((d) => ({ ...d, open }))}
        folders={flatFolders}
        defaultParentId={folderDialog.parentId}
        editFolder={folderDialog.editFolder}
        onSubmit={handleFolderSubmit}
        isPending={createFolder.isPending || updateFolder.isPending}
      />

      <UploadDocumentDialog
        open={uploadDialog}
        onOpenChange={setUploadDialog}
        folders={flatFolders}
        tags={tags ?? []}
        defaultFolderId={store.selectedFolderId}
        onUpload={handleUpload}
        isPending={uploadDoc.isPending}
      />

      <MoveDocumentsDialog
        open={moveDialog}
        onOpenChange={setMoveDialog}
        folders={flatFolders}
        documentCount={moveDocIds.length}
        onMove={handleMove}
        isPending={updateDoc.isPending || bulkAction.isPending}
      />

      <TagManagementDialog
        open={tagDialog}
        onOpenChange={setTagDialog}
        tags={tags ?? []}
        onCreate={(data) => {
          createTag.mutate(data, {
            onSuccess: () => toast.success(t("toast.tagCreated")),
            onError: () => toast.error(t("toast.error")),
          });
        }}
        onDelete={(id) => {
          deleteTag.mutate(id, {
            onSuccess: () => toast.success(t("toast.tagDeleted")),
            onError: () => toast.error(t("toast.error")),
          });
        }}
        isCreating={createTag.isPending}
      />

      <DeleteConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog((d) => ({ ...d, open }))}
        title={deleteDialog.title}
        description={deleteDialog.description}
        onConfirm={deleteDialog.onConfirm}
        isPending={deleteDoc.isPending || deleteFolder.isPending || bulkAction.isPending}
      />
    </div>
  );
}
