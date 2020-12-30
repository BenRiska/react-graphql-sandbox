const Post = require("../../models/Post")
const checkAuth = require('../../util/check-auth');

module.exports = {
    Query: {
       async getPosts(){
            try{
                const posts = await Post.find().sort({createdAt: -1});
                return posts
            }catch(err){
                throw new Error(err)
            }
        },
        async getPost(_, { postId }) {
            try {
              const post = await Post.findById(postId);
              if (post) {
                return post;
              } else {
                throw new Error('Post not found');
              }
            } catch (err) {
              throw new Error(err);
            }
          }
        },
        Mutation: {
            async createPost(_, { body }, context) {
                // check user is authorized
                const user = checkAuth(context);
                
                // throw error if post body is empty 
                if (body.trim() === '') {
                  throw new Error('Post body must not be empty');
                }
          
                // create post
                const newPost = new Post({
                  body,
                  user: user.id,
                  username: user.username,
                  createdAt: new Date().toISOString()
                });
          
                // save post
                const post = await newPost.save();
          
                
                // context.pubsub.publish('NEW_POST', {
                //   newPost: post
                // });
          
                // return post
                return post;
              },
              async deletePost(_, { postId }, context) {

                // check user is authorized
                const user = checkAuth(context);
          
                // find and delete post
                // or throw error if no post found/wrong user
                try {
                  const post = await Post.findById(postId);
                  if (user.username === post.username) {
                    await post.delete();
                    return 'Post deleted successfully';
                  } else {
                    throw new AuthenticationError('Action not allowed');
                  }
                } catch (err) {
                  throw new Error(err);
                }
              },
        }
}
