document.addEventListener('DOMContentLoaded', function() {
  // Add click listeners to blog post tags
  const blogPostTags = document.querySelectorAll('div.blog-tags span.blog-tag');
  
  blogPostTags.forEach(tagElement => {
    tagElement.style.cursor = 'pointer';
    tagElement.style.textDecoration = 'none';
    
    tagElement.addEventListener('click', function() {
      const clickedTag = this.textContent.trim();
      // Store the selected tag in localStorage
      localStorage.setItem('selectedBlogTag', clickedTag);
      
      // Open main blog page in new tab
      window.open('/blog', '_blank');
    });
  });

  function transformToBlogListing(selectedTag) {
    // Hide original blog post content
    const container = document.querySelector('.container');
    const originalContent = container.innerHTML;
    
    // Create new blog listing structure
    container.innerHTML = `
      <div class="main">
        <span class="left"><h1><a href="/" style="color: black; text-decoration: none;">Himanshu</a></h1></span>
        <span class="right">
          <h1>
            <a href="mailto:waitasecant@gmail.com" class="social" style="margin-right: 24px;"><i class="far fa-envelope"></i></a><a href="https://www.strava.com/athletes/waitasecant" target="_blank" class="social" style="margin-right: 24px;"><i class="fab fa-strava"></i></a><a href="https://x.com/intent/follow?screen_name=waitasecant" target="_blank" class="social" style="margin-right: 24px;"><i class="fab fa-x-twitter"></i></a><a href="https://github.com/waitasecant/" target="_blank" class="social" style="margin-right: 24px;"><i class="fab fa-github"></i></a><a href="https://www.linkedin.com/in/waitasecant" target="_blank" class="social"><i class="fab fa-linkedin"></i></a>
          </h1>
        </span>
      </div>

      <h2>Welcome to my Blog</h2>

      <div class="blog-page-entry tags-container">
        <div id="tags-list"></div>
      </div>

      <a class="a-blog-page-entry" href="/blog/just-another-attention-is-all-you-need/" target="_blank">
        <div class="blog-page-entry">
          <h3 class="blog-page-title" data-required="true"></h3>
          <p class="blog-page-summary" data-required="true"></p>
          <p class="blog-page-meta" data-required="true"></p>
        </div>
      </a>

      <a class="a-blog-page-entry" href="/blog/cleanlab-saves-the-day-an-implementation/" target="_blank">
        <div class="blog-page-entry">
          <h3 class="blog-page-title" data-required="true"></h3>
          <p class="blog-page-summary" data-required="true"></p>
          <p class="blog-page-meta" data-required="true"></p>
        </div>
      </a>
    `;

    // Now run the same blog loading logic as main page
    loadBlogEntriesAndFilter(selectedTag);
  }

  function loadBlogEntriesAndFilter(targetTag) {
    // Function to check if any blog entries are visible and remove tags container if none are
    function removeTagsContainerIfNoVisibleEntries() {
      const blogEntries = document.querySelectorAll('a.a-blog-page-entry');
      const tagsContainer = document.querySelector('div.blog-page-entry.tags-container');
          
      if (blogEntries.length === 0 || !tagsContainer) {
        if (tagsContainer) tagsContainer.remove();
        return;
      }

      let hasVisibleEntry = false;
      blogEntries.forEach(entry => {
        if (entry.style.display !== 'none') {
          hasVisibleEntry = true;
        }
      });

      if (!hasVisibleEntry && tagsContainer) {
        tagsContainer.remove();
      }
    }

    const blogEntries = document.querySelectorAll('a.a-blog-page-entry');
    let loadedEntries = 0;
    let allTags = new Set();
    
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
        return;
      }

      entry.style.display = 'none';
          
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
                  
        const blogTitleElement = doc.querySelector('h2.blog-title');
        const contentElement = doc.querySelector('.blog-content');
        const blogMetaElement = doc.querySelector('p.blog-meta');
        const blogTagsElement = doc.querySelector('div.blog-tags');
                  
        let hasAllRequiredContent = true;
                  
        if (entryTitleElement && blogTitleElement) {
          const titleText = blogTitleElement.textContent.trim();
          entryTitleElement.textContent = titleText;
        } else if (entryTitleElement.dataset.required === "true" && !blogTitleElement) {
          hasAllRequiredContent = false;
        }
                  
        if (summaryElement && contentElement) {
          const fullText = contentElement.textContent.trim();
          let summary = fullText.substring(0, 177);
          if (fullText.length > 177) {
             summary += '...';
          }
          summaryElement.textContent = summary;
        } else if (summaryElement.dataset.required === "true" && !contentElement) {
          hasAllRequiredContent = false;
        }
                  
        if (metaElement && blogMetaElement) {
          const metaText = blogMetaElement.textContent.trim();
          metaElement.textContent = metaText;
        } else if (metaElement.dataset.required === "true" && !blogMetaElement) {
          hasAllRequiredContent = false;
        }
                  
        if (blogTagsElement) {
          const tagElements = blogTagsElement.querySelectorAll('.blog-tag');
          const entryTags = [];
                      
          const tagsDisplayContainer = document.createElement('div');
          tagsDisplayContainer.className = 'blog-page-tags';
                      
          tagElements.forEach(tagElement => {
            const tag = tagElement.textContent.trim();
            if (tag) {
              entryTags.push(tag);
              allTags.add(tag);
                  
              const tagSpan = document.createElement('span');
              tagSpan.className = 'blog-page-tag';
              tagSpan.textContent = tag;
              tagsDisplayContainer.appendChild(tagSpan);
            }
          });
                      
          if (entryTags.length > 0) {
            metaElement.parentNode.insertBefore(tagsDisplayContainer, metaElement.nextSibling);
            entry.setAttribute('data-tags', entryTags.join(','));
          }
        }
                  
        if (hasAllRequiredContent) {
          entry.style.display = '';
        }
                  
        loadedEntries++;
                  
        if (loadedEntries === blogEntries.length) {
          createTagsFilterUI(Array.from(allTags).sort(), targetTag);
          removeTagsContainerIfNoVisibleEntries();
        }
       })
        .catch(error => {
          console.error('Error fetching blog content for ' + href + ':', error);
          loadedEntries++;
                  
          if (loadedEntries === blogEntries.length) {
            createTagsFilterUI(Array.from(allTags).sort(), targetTag);
            removeTagsContainerIfNoVisibleEntries();
          }
        });
      });
      
      function createTagsFilterUI(tags, selectedTag) {
        if (tags.length === 0) {
          removeTagsContainerIfNoVisibleEntries();
          return;
        }
          
        const tagsListElement = document.getElementById('tags-list');
        if (!tagsListElement) return;
          
        tagsListElement.innerHTML = '';

        const allTag = document.createElement('span');
        allTag.className = 'filter-tag';
        allTag.textContent = 'All';
        allTag.setAttribute('data-tag', 'all');
        tagsListElement.appendChild(allTag);
          
        tags.forEach(tag => {
           const tagElement = document.createElement('span');
          tagElement.className = 'filter-tag';
          tagElement.textContent = tag;
          tagElement.setAttribute('data-tag', tag);
          
          // Pre-select the target tag
          if (tag === selectedTag) {
            tagElement.classList.add('selected');
          }
          
          tagsListElement.appendChild(tagElement);
        });
          
        const filterTags = document.querySelectorAll('.filter-tag');
        filterTags.forEach(tag => {
          tag.addEventListener('click', function() {
            const isAll = this.getAttribute('data-tag') === 'all';
            const allTagElement = document.querySelector('.filter-tag[data-tag="all"]');
            const nonAllTags = Array.from(document.querySelectorAll('.filter-tag:not([data-tag="all"])'));
                  
            if (isAll) {
              if (!this.classList.contains('selected')) {
                this.classList.add('selected');
                nonAllTags.forEach(t => t.classList.remove('selected'));
              }
            } else {
              this.classList.toggle('selected');
                      
              if (this.classList.contains('selected')) {
                allTagElement.classList.remove('selected');
              }
                      
              const anySpecificTagSelected = nonAllTags.some(t => t.classList.contains('selected'));
              if (!anySpecificTagSelected) {
                allTagElement.classList.add('selected');
              }
            }
                  
            applyTagFiltering();
          });
      });
      
      // Apply initial filtering for the selected tag
      applyTagFiltering();
        
      removeTagsContainerIfNoVisibleEntries();
      }
      
      function applyTagFiltering() {
        const selectedFilterTags = Array.from(document.querySelectorAll('#tags-list .filter-tag.selected'))
                                  .map(tag => tag.getAttribute('data-tag'));
          
        blogEntries.forEach(entry => {
          if (selectedFilterTags.includes('all')) {
            entry.style.display = '';
          } else {
            const entryTagsStr = entry.getAttribute('data-tags');
            if (entryTagsStr) {
              const entryTagsArray = entryTagsStr.split(',');
              const shouldShow = selectedFilterTags.some(filterTag => entryTagsArray.includes(filterTag));
              entry.style.display = shouldShow ? '' : 'none';
            } else {
              entry.style.display = 'none';
            }
          }
        });
          
        removeTagsContainerIfNoVisibleEntries();
      }
    }
  });
