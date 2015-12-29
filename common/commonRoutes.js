export default {
    GET: (req, res, next, model) => {
        let dateQuery = req.query.date ? new Date(req.query.date) : new Date();
        let group = req.query.group;
        model.find({
            "group": group,
            "createdOn": {
                "$lt": dateQuery
            }
        }, null, { sort: {createdOn: -1}, limit: 9 }, (err, results) => {
            if (err) {
                return res.status(400).json({ message: "Error: could not find items requested"});
            }
            res.json(results);
        });
    },

    DELETE: (req, res, next, model) => {
        let id = req.body.id;
        if (!id) {
            return res.status(400).json({ message: "Error: no id given for deletion"});
        }
        model.findByIdAndRemove(id, (err) => {
            if (err) {
                return res.status(500).json({ message: "Error: failed to delete " });
            }
            return res.json({ message: `Deleted: ${id}`});
        });
    }
};
