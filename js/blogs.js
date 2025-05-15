document.addEventListener('DOMContentLoaded', function() {
  // Function to check if any blog entries are visible and remove tags container if none are
  function removeTagsContainerIfNoVisibleEntries() {
    const blogEntries = document.querySelectorAll('a.a-blog-page-entry');
    const tagsContainer = document.querySelector('div.blog-page-entry.tags-container');
        
    // If there are no blog entries at all or no tags container, exit early
    if (blogEntries.length === 0 || !tagsContainer) {
      if (tagsContainer) tagsContainer.remove();
        return;
      }

    // Check if any entries are visible
    let hasVisibleEntry = false;
    blogEntries.forEach(entry => {
      if (entry.style.display !== 'none') {
        hasVisibleEntry = true;
      }
    });

    // Remove the tags container if no entries are visible
      if (!hasVisibleEntry && tagsContainer) {
        tagsContainer.remove();
      }
    }

    const blogEntries = document.querySelectorAll('a.a-blog-page-entry');
    let loadedEntries = 0;
    let allTags = new Set(); // To store all unique tags
    
    // If there are no blog entries at all, remove the tags container right away
    if (blogEntries.length === 0) {
      removeTagsContainerIfNoVisibleEntries();
      return;
    }
    
    blogEntries.forEach(function(entry) {
      const href = entry.getAttribute('href');
      if (!href) return;

      const entryTitleElement = entry.querySelector('h3.blog-page-title');
      const summaryElement = entry.querySelector('p.blog-page-summary');
      const metaElement = entry.querySelector('p.blog-page-meta');
        
      if (!entryTitleElement || !summaryElement || !metaElement) {
        console.log('Missing elements:', 
        !entryTitleElement ? 'title ' : '', 
        !summaryElement ? 'summary ' : '', 
        !metaElement ? 'meta ' : '');
        return;
      }

      // Initially hide the entry until content loads
      entry.style.display = 'none';
      console.log('Processing blog entry:', href);
        
      // Fetch the content from the linked page
      fetch(href)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.text();
      })
      .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
                
        // Look for standard elements
        const blogTitleElement = doc.querySelector('h2.blog-title');
        const contentElement = doc.querySelector('.blog-content');
        const blogMetaElement = doc.querySelector('p.blog-meta');
        const blogTagsElement = doc.querySelector('div.blog-tags');
                
        let hasAllRequiredContent = true;
                
        // Process title
        if (blogTitleElement) {
          const titleText = blogTitleElement.textContent.trim();
          entryTitleElement.textContent = titleText;
        } else {
          hasAllRequiredContent = false;
        }
                
        // Process content
        if (contentElement) {
          const fullText = contentElement.textContent.trim();
          let summary = fullText.substring(0, 177);
          summary += '...';
          summaryElement.textContent = summary;
        } else {
          hasAllRequiredContent = false;
        }
                
        // Process meta
        if (blogMetaElement) {
          const metaText = blogMetaElement.textContent.trim();
          metaElement.textContent = metaText;
        } else {
          hasAllRequiredContent = false;
        }
                
        // Process tags if they exist
        if (blogTagsElement) {
          const tagElements = blogTagsElement.querySelectorAll('.blog-tag');
          const entryTags = [];
                    
        // Create tags container for this blog entry
        const tagsContainer = document.createElement('div');
        tagsContainer.className = 'blog-page-tags';
                    
        // Process each tag
        tagElements.forEach(tagElement => {
          const tag = tagElement.textContent.trim();
          if (tag) {
            entryTags.push(tag);
            allTags.add(tag); // Add to global set of tags
                
            // Create tag element for this entry
            const tagSpan = document.createElement('span');
            tagSpan.className = 'blog-page-tag';
            tagSpan.textContent = tag;
            tagsContainer.appendChild(tagSpan);
          }
        });
                    
        // Add tags container after meta element
        if (entryTags.length > 0) {
          metaElement.parentNode.insertBefore(tagsContainer, metaElement.nextSibling);
            
          // Store tags as data attribute for filtering
          entry.setAttribute('data-tags', entryTags.join(','));
        }
        }
                
        // Show the entry only if all required content was found
        if (hasAllRequiredContent) {
          entry.style.display = '';
        } else {
          console.log(`Blog entry ${href} missing required content`);
        }
                
        loadedEntries++;
                
        // If this was the last entry to process, create the tags filter UI
        if (loadedEntries === blogEntries.length) {
          console.log('All blog entries processed');
          createTagsFilterUI(Array.from(allTags).sort());
          removeTagsContainerIfNoVisibleEntries(); // Check if any entries are visible
        }
     })
      .catch(error => {
        console.error('Error fetching blog content:', error);
        loadedEntries++;
                
        if (loadedEntries === blogEntries.length) {
          createTagsFilterUI(Array.from(allTags).sort());
          removeTagsContainerIfNoVisibleEntries(); // Check if any entries are visible
        }
      });
    });
    
    // Function to create the tags filtering UI
    function createTagsFilterUI(tags) {
      if (tags.length === 0) {
        removeTagsContainerIfNoVisibleEntries();
        return;
      }
        
      const tagsListElement = document.getElementById('tags-list');
      if (!tagsListElement) return;
        
      // Create "All" tag first
      const allTag = document.createElement('span');
      allTag.className = 'filter-tag selected';
      allTag.textContent = 'All';
      allTag.setAttribute('data-tag', 'all');
      tagsListElement.appendChild(allTag);
        
      // Create tags for filtering
      tags.forEach(tag => {
         const tagElement = document.createElement('span');
        tagElement.className = 'filter-tag';
        tagElement.textContent = tag;
        tagElement.setAttribute('data-tag', tag);
        tagsListElement.appendChild(tagElement);
      });
        
      // Add click event for multi-tag filtering
      const filterTags = document.querySelectorAll('.filter-tag');
      filterTags.forEach(tag => {
        tag.addEventListener('click', function() {
          const isAll = this.getAttribute('data-tag') === 'all';
          const allTagElement = document.querySelector('.filter-tag[data-tag="all"]');
          const nonAllTags = Array.from(document.querySelectorAll('.filter-tag:not([data-tag="all"])'));
                
          if (isAll) {
            // If "All" is clicked, select only it and deselect all other tags
            if (!this.classList.contains('selected')) {
              this.classList.add('selected');
              nonAllTags.forEach(t => t.classList.remove('selected'));
            }
          } else {
            // For non-"All" tags: toggle selection
            this.classList.toggle('selected');
                    
            // If this tag is now selected, deselect "All"
            if (this.classList.contains('selected')) {
              allTagElement.classList.remove('selected');
            } else {
              // If no specific tags are selected, select "All"
              const anyTagSelected = nonAllTags.some(t => t.classList.contains('selected'));
              if (!anyTagSelected) {
                allTagElement.classList.add('selected');
              }
            }
                    
            // If all non-"All" tags are selected, select just "All" instead
            const allTagsSelected = nonAllTags.every(t => t.classList.contains('selected'));
              if (allTagsSelected) {
                allTagElement.classList.add('selected');
                nonAllTags.forEach(t => t.classList.remove('selected'));
              }
            }
                
            // Apply filtering
            applyTagFiltering();
        });
    });
        
    // Check again after creating the UI
    removeTagsContainerIfNoVisibleEntries();
    }
    
    // Function to apply tag filtering based on selected tags
    function applyTagFiltering() {
      const selectedTags = Array.from(document.querySelectorAll('.filter-tag.selected'))
      .map(tag => tag.getAttribute('data-tag'));
        
      // If "All" is selected, show all entries
      if (selectedTags.includes('all')) {
        blogEntries.forEach(entry => {
          entry.style.display = '';
        });
        removeTagsContainerIfNoVisibleEntries();
        return;
        }
        
        // Filter by selected tags - show entries that have ANY of the selected tags
        blogEntries.forEach(entry => {
          const entryTagsStr = entry.getAttribute('data-tags') || '';
            
          if (!entryTagsStr) {
            entry.style.display = 'none';
            return;
          }
            
          const entryTags = entryTagsStr.split(',');
            
          // Show entry if it has at least one of the selected tags
          const shouldShow = selectedTags.some(tag => entryTags.includes(tag));
          entry.style.display = shouldShow ? '' : 'none';
        });
        
        removeTagsContainerIfNoVisibleEntries();
    }
});
