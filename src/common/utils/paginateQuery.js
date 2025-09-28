const paginateQuery = async (
  Model,
  currentPage = 0,
  pageSize = 10,
  conditionObject = {},
  options = {}
) => {
  try {
    // Convert to numbers and validate

    const limit = Math.min(50, parseInt(pageSize));
    const page = Math.min(50, parseInt(currentPage));
    const skip = page * limit;

    // Get total count for pagination
    const totalItems = await Model.countDocuments(conditionObject);
    const totalPages = Math.ceil(totalItems / limit);

    const {
      sort = { createdAt: -1 },
      populate = null,
      select = null,
    } = options;
    // Build query
    let query = Model.find(conditionObject).sort(sort).skip(skip).limit(limit);

    // Add select if provided
    if (select) {
      query = query.select(select);
    }

    // Add populate if provided
    if (populate) {
      query = query.populate(populate);
    }

    // Execute query
    const records = await query.lean();

    // Return paginated result
    return {
      success: true,
      data: {
        pagination: {
          currentPage: page,
          pageSize: limit,
          totalItems,
          totalPages: Math.max(0, totalPages - 1), // Total pages start from 0
        },
        records,
      },
    };
  } catch (error) {
    console.log(error.message);
    throw error;
  }
};

/**
 * Build search condition for text fields
 * @param {string} searchText - Text to search
 * @param {Array} fields - Array of field names to search in
 * @returns {Object} MongoDB query condition
 */
const buildSearchCondition = (searchText, fields = []) => {
  if (!searchText || !searchText.trim() || fields.length === 0) {
    return {};
  }

  const searchRegex = { $regex: searchText.trim(), $options: "i" };

  if (fields.length === 1) {
    return { [fields[0]]: searchRegex };
  }

  return {
    $or: fields.map((field) => ({ [field]: searchRegex })),
  };
};

/**
 * Build date range condition
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @param {string} field - Date field name (default: 'createdAt')
 * @returns {Object} MongoDB date range condition
 */
const buildDateRangeCondition = (startDate, endDate, field = "createdAt") => {
  const condition = {};

  if (startDate) {
    condition[field] = { ...condition[field], $gte: new Date(startDate) };
  }

  if (endDate) {
    const endDateTime = new Date(endDate);
    endDateTime.setHours(23, 59, 59, 999); // End of day
    condition[field] = { ...condition[field], $lte: endDateTime };
  }

  return condition;
};

// Example usage in controller
const exampleUsage = {
  // Basic usage
  async getConversations(req, res) {
    try {
      const { name, pageSize, currentPage } = req.query;
      const userId = req.currentUser.id;

      // Build condition object
      const conditionObject = { userId };

      // Add name search if provided
      if (name && name.trim()) {
        Object.assign(
          conditionObject,
          buildSearchCondition(name, ["name", "description"])
        );
      }

      // Use pagination helper
      const result = await paginateQuery(
        Conversation, // Model
        conditionObject, // Conditions
        pageSize, // Page size
        currentPage, // Current page (starts from 0)
        {
          sort: { updatedAt: -1 }, // Custom sort
          populate: "userId", // Populate user info
          select: "name description createdAt updatedAt", // Select specific fields
        }
      );

      if (!result.success) {
        return res.status(500).json({
          message: "Database error",
          error: result.error,
          success: false,
          status: 500,
        });
      }

      res.status(200).json({
        message: "Here is your conversation",
        success: true,
        status: 200,
        ...result.data,
      });
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
        success: false,
        status: 500,
      });
    }
  },

  // Advanced usage with multiple filters
  async getAdvancedConversations(req, res) {
    try {
      const { name, status, startDate, endDate, pageSize, currentPage } =
        req.query;
      const userId = req.currentUser.id;

      // Build complex condition object
      let conditionObject = { userId };

      // Add search condition
      if (name) {
        Object.assign(
          conditionObject,
          buildSearchCondition(name, ["name", "description"])
        );
      }

      // Add status filter
      if (status) {
        conditionObject.status = status;
      }

      // Add date range filter
      if (startDate || endDate) {
        Object.assign(
          conditionObject,
          buildDateRangeCondition(startDate, endDate, "createdAt")
        );
      }

      const result = await paginateQuery(
        Conversation,
        conditionObject,
        pageSize,
        currentPage,
        {
          sort: { createdAt: -1, name: 1 }, // Multiple sort fields
          populate: [
            { path: "userId", select: "name email" },
            { path: "messages", select: "content createdAt" },
          ],
        }
      );

      if (!result.success) {
        throw new Error(result.error);
      }

      res.status(200).json({
        message: "Conversations retrieved successfully",
        success: true,
        status: 200,
        ...result.data,
      });
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
        success: false,
        status: 500,
      });
    }
  },
};

module.exports = {
  paginateQuery,
  buildSearchCondition,
  buildDateRangeCondition,
  exampleUsage, // Include examples
};
