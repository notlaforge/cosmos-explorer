import "bootstrap/dist/css/bootstrap.css";
import { initializeIcons } from "office-ui-fabric-react/lib/Icons";
import React from "react";
import * as ReactDOM from "react-dom";
import { initializeConfiguration } from "../Config";
import {
  NotebookViewerComponent,
  NotebookViewerComponentProps
} from "../Explorer/Controls/NotebookViewer/NotebookViewerComponent";
import { IGalleryItem, JunoClient } from "../Juno/JunoClient";
import * as GalleryUtils from "../Utils/GalleryUtils";
import { GalleryHeaderComponent } from "../Explorer/Controls/Header/GalleryHeaderComponent";
import { FileSystemUtil } from "../Explorer/Notebook/FileSystemUtil";

const onInit = async () => {
  initializeIcons();
  await initializeConfiguration();
  const galleryViewerProps = GalleryUtils.getGalleryViewerProps(window.location.search);
  const notebookViewerProps = GalleryUtils.getNotebookViewerProps(window.location.search);
  const backNavigationText = galleryViewerProps.selectedTab && GalleryUtils.getTabTitle(galleryViewerProps.selectedTab);
  const hideInputs = notebookViewerProps.hideInputs;

  const notebookUrl = decodeURIComponent(notebookViewerProps.notebookUrl);
  render(notebookUrl, backNavigationText, hideInputs);

  const galleryItemId = notebookViewerProps.galleryItemId;
  if (galleryItemId) {
    const junoClient = new JunoClient();
    const notebook = await junoClient.getNotebook(galleryItemId);
    render(notebookUrl, backNavigationText, hideInputs, notebook.data);
  }
};

const render = (notebookUrl: string, backNavigationText: string, hideInputs: boolean, galleryItem?: IGalleryItem) => {
  const props: NotebookViewerComponentProps = {
    junoClient: galleryItem ? new JunoClient() : undefined,
    notebookUrl,
    galleryItem,
    backNavigationText,
    hideInputs,
    onBackClick: undefined,
    onTagClick: undefined
  };

  if (galleryItem) {
    document.title = FileSystemUtil.stripExtension(galleryItem.name, "ipynb");
  }

  const element = (
    <>
      <header>
        <GalleryHeaderComponent />
      </header>
      <div style={{ marginLeft: 120, marginRight: 120 }}>
        <NotebookViewerComponent {...props} />
      </div>
    </>
  );

  ReactDOM.render(element, document.getElementById("notebookContent"));
};

// Entry point
window.addEventListener("load", onInit);
