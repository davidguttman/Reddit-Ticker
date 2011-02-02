    function RedditReader (opts) {
      if (! (this instanceof arguments.callee)) {
          return new arguments.callee(arguments);
      }
      var self = this;

      function init (opts) {
        self.url = opts.url;
        self.target = opts.target;
        get_data(data_ready);
      }

      // create "get_data" method
      function get_data (cb) {
        // get the remote data (jsonp)
        // and call "data_ready" method when finished
        $.getJSON(self.url, data_ready);
      }

      // create "data_ready" method
      // this method is called when data is returned
      function data_ready (data) {
        process_remote_data(data);
        create_post_elements();
        cycle_posts();
      }
      
      // the fade cycle "loop"
      function cycle_posts () {
        // advance the post we show
        advance_post();
        // wait 3000ms then do it again
        setTimeout(cycle_posts, 5000);
      }
      
      function advance_post () {
        // if this is the first run, next post will be the first one
        self.next_post_i = self.next_post_i || 0;
        
        // get a reference to the element
        self.next_post = self.post_elements[self.next_post_i];
        
        if (self.last_post) {
          // if there was a last post, this isn't the first run through
          // let's hide it before showing the next one
          
          self.last_post.fadeOut(function() {
            self.next_post.fadeIn();
          });
          
        } else {
          // first run through, no previous post to hide
          self.next_post.fadeIn();
        }
        
        // increment the index for next time
        self.next_post_i += 1;
        // ..and go back to 0 if we've gone through them all
        if (self.next_post_i >= self.post_elements.length) {
          self.next_post_i = 0;
        }
        
        // lets store the faded in element as self.last_post
        // so that we can fade it out on the next run-through
        self.last_post = self.next_post;
      }

      // create a method to create post elements
      function create_post_elements () {
        // create an array to store our elements
        self.post_elements = [];
        
        // iterate over our stored post data
        // create dom elements
        // append them to our target div
        $.each(self.post_data, function(i, post) {
          var post_element = $('<div/>', {
                'class': 'rr_reddit_post',
                'id': 'reddit_post_' + i
              }),
              title_div = $('<div/>', {
                'class': 'rr_title'
              }),
              title_link = $('<a/>', {
                'href': post.url,
                'class': 'rr_title_link',
                'text': post.title,
                'target': '_blank'
              }),
              comments_div = $('<div/>', {
                'class': 'rr_comments'
              }),
              comments_link = $('<a/>', {
                'href': post.comments_link,
                'class': 'rr_comments_link',
                'text': '( '+post.num_comments+' comments )',
                'target': '_blank'
              });
          
          title_div.append(title_link);
          comments_div.append(comments_link);
          
          post_element.append(title_div);
          post_element.append(comments_div);
          
          post_element.hide();
          
          self.target.append(post_element);

          // add it to our self.post_elements array
          self.post_elements.push(post_element);
        });
      }

      // create a method to process the remote data
      function process_remote_data (data) {
        // create an empty array where we'll store the posts data
        self.post_data = [];

        // no we iterate over the remote data, creating post objects
        // and adding them to the array we just created
        
        $.each(data.data.children, function(i, remote_post) {
          // create a temporary object
          var local_post = {};
          
          // use it to store the properties of interest
          local_post.title = remote_post.data.title;
          local_post.url = remote_post.data.url;
          local_post.comments_link = 'http://reddit.com' + remote_post.data.permalink;
          local_post.num_comments = remote_post.data.num_comments;
          
          // store that object in our post_data array
          self.post_data.push(local_post);
        });
      }

      init(opts);
      return self;
    }

    $(document).ready(function() {
      // create an instance, passing in url and target div
      // we'll make this into jQuery plugin later
      var reddit_reader = new RedditReader({
        target: $('#reddit_reader'),
        url: 'http://www.reddit.com/r/programming.json?jsonp=?'
      });
    });