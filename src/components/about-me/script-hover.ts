const technologyLinks = document.querySelectorAll(`[data-tech]`);

function getSameTechnologyElements(element: EventTarget | null) {
  if (!element) {
    return [];
  }

  const technologyName = (element as HTMLElement).dataset.tech;
  return [...document.querySelectorAll(`[data-tech="${technologyName}"]`)];
}

function changeHighlightClassForElements(
  elements: Element[],
  operation: "add" | "remove",
  pinMode?: boolean,
) {
  for (let j = 0; j < elements.length; j++) {
    const sameTechnologyElement = elements[j] as HTMLElement;

    if (operation === "add") {
      sameTechnologyElement.classList.add("text-primary", "underline");
      if (pinMode) {
        sameTechnologyElement.dataset.pinned = "true";
      }

      continue;
    }

    if (operation === "remove") {
      if (!pinMode && sameTechnologyElement.dataset.pinned === "true") {
        continue;
      }

      sameTechnologyElement.classList.remove("text-primary", "underline");
      sameTechnologyElement.dataset.pinned = "false";
    }
  }
}

// add mouseover event listener to each technology link, which adds a class to all elements with the same technology name
for (let i = 0; i < technologyLinks.length; i++) {
  const technologyLink = technologyLinks.item(i);
  if (!technologyLink) {
    continue;
  }

  technologyLink.addEventListener("mouseover", (event) => {
    const sameTechnologyElements = getSameTechnologyElements(event.target);
    changeHighlightClassForElements(sameTechnologyElements, "add");
  });

  technologyLink.addEventListener("mouseout", (event) => {
    const sameTechnologyElements = getSameTechnologyElements(event.target);
    changeHighlightClassForElements(sameTechnologyElements, "remove");
  });

  technologyLink.addEventListener("click", (event) => {
    const sameTechnologyElements = getSameTechnologyElements(event.target);

    if (sameTechnologyElements.length === 0) {
      return;
    }

    const firstElement = sameTechnologyElements[0] as HTMLElement;
    const isPinned = firstElement.dataset.pinned === "true";

    changeHighlightClassForElements(
      sameTechnologyElements,
      isPinned ? "remove" : "add",
      true,
    );
  });
}
