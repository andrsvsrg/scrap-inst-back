export const getUserInfoFromResponse = (user) => {
  return {
    userInstId: user.id,
    username: user.username,
    biography: user.biography,
    followed: user.edge_followed_by.count,
    follow: user.edge_follow.count,
    fullName: user.full_name,
    categoryName: user.category_name,
    profilePicUrl: user.profile_pic_url_hd || user.profile_pic_url,
    bioLinks: user.bio_links.map((link) => link.url).filter((e) => e)
  }
}

export const getPostInfoFromResponse = (postsArray, userObjectId = '') => {
  return postsArray.map((p) => {
    return {
      typename: p.node.__typename, // string
      shortcode: p.node.shortcode,  // string
      displayUrl: p.node.display_url,  // string
      timestamps: p.node.taken_at_timestamp,  // number
      videoUrl: p.node.video_url || "",  // string
      videoViewCount: p.node.video_view_count || 0, // number
      likes: p.node?.edge_liked_by?.count || p?.node?.edge_liked_by ||  0, // number
      isVideo: p.node.is_video  , // boolean
      edgeChildren: p.node.edge_sidecar_to_children?.edges?.map((child) => {
        return {
          typename: child.node.__typename,
          shortcode: child.node.shortcode,
          displayUrl: child.node.display_url,
          isVideo: child.node.is_video ,
          videoUrl: child.node.video_url || "",
          videoViewCount: child.node.video_view_count || 0
        }
      }) || [] ,
      author: userObjectId,
    }
  })
}